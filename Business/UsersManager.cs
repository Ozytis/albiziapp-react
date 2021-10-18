using Common;
using Entities;
using Entities.Enums;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business
{
    public class UsersManager : BaseManager
    {
        public UsersManager(DataContext dataContext, TitlesManager titlesManager, MissionsManager missionsManager, IUserNotify userNotify) : base(dataContext)
        {
            this.TitlesManager = titlesManager;
            this.MissionsManager = missionsManager;
            this.UserNotify = userNotify;
        }

        public IUserNotify UserNotify { get; }
        public TitlesManager TitlesManager { get; }

        public MissionsManager MissionsManager { get; }

        public async Task<User> SelectAsync(string osmId)
        {
            return (await this.DataContext.Users
                .FindAsync(u => u.OsmId == osmId))
                .FirstOrDefault();
        }

        public async Task<User> LoginAsync(string osmId, string userName)
        {
            User existing = await this.SelectAsync(osmId);

            if (existing != null)
            {
                return existing;
            }

            existing = new User
            {
                OsmId = osmId,
                Name = userName,
                Role = Entities.Enums.UserRole.NONE
            };

            await this.DataContext.Users.InsertOneAsync(existing);

            return existing;
        }

        public async Task AddExplorationPoints(string userId, List<PointHistory> points)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }

            user.ExplorationPoints += points.Sum(p => p.Point);
            if (user.ExplorationPointsHistory == null)
            {
                user.ExplorationPointsHistory = points.ToArray();
            }
            else
            {
                var pointsList = user.ExplorationPointsHistory.ToList();
                pointsList.AddRange(points);
                user.ExplorationPointsHistory = pointsList.ToArray();
            }
            await this.UserNotify.SendNotif(userId, "Vous avez gagné " + points.Sum(p => p.Point) + " point(s)");

            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
        }

        public async Task AddKnowledegePoints(string userId, List<PointHistory> points)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }

            user.KnowledgePoints += points.Sum(p => p.Point);
            if (user.KnowledgePointsHistory == null)
            {
                user.KnowledgePointsHistory = points.ToArray();
            }
            else
            {
                var pointsList = user.KnowledgePointsHistory.ToList();
                pointsList.AddRange(points);
                user.KnowledgePointsHistory = pointsList.ToArray();
            }
            await this.UserNotify.SendNotif(userId, "Vous avez gagné " + points.Sum(p => p.Point) + " point(s)");
            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
        }

        public async Task AddTitles(string userId)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }
            var titles = await this.TitlesManager.GetTitlesByPoints(user.ExplorationPoints, user.KnowledgePoints);
            if (titles != null && titles.Count > 0)
            {
                if (user.Titles == null)
                {
                    user.Titles = titles.Select(t => t.Id).ToArray();
                }
                else
                {
                    var titlesToAdd = titles.Where(t => !user.Titles.Any(ut => ut == t.Id)).Select(t => t.Id).ToList();
                    if (titlesToAdd.Count > 0)
                    {
                        user.Titles = user.Titles.Concat(titlesToAdd).ToArray();
                        await this.UserNotify.SendNotif(userId, "Vous avez debloqué un nouveau titre !");
                    }
                }
                await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
            }
        }


        public async Task UpdateMissionProgression(string userId, MissionProgress progress)
        {
            var user = await this.SelectAsync(userId);

            if (user == null)
            {
                return;
            }

            user.MissionProgress = progress;
            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
        }

        public async Task EndCurrentMission(string userId, MissionProgressionHistory[] historyToUpdate)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }

            var missionsCompleted = user.MissionCompleted?.ToList() ?? new List<MissionComplete>();
            Mission mission = await this.MissionsManager.GetMissionById(user.MissionProgress.MissionId);

            MissionComplete missionComplete = new MissionComplete
            {
                IdMission = user.MissionProgress.MissionId,
                StartDate = user.MissionProgress.StartDate,
                CompletedDate = DateTime.UtcNow,
                History = historyToUpdate
            };
            var nbReleve = missionComplete.History?.Count();
            missionsCompleted.Add(missionComplete);
            user.MissionCompleted = missionsCompleted.ToArray();
            user.MissionProgress = null;

            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);

            
            await this.UserNotify.SendInfoNotif(userId, $"Vous avez terminé la mission en faisant {nbReleve} relevés !");
        }
           

        public bool IsUserAdmin(User user)
        {
            if (user.Role.HasValue && user.Role.Value.HasFlag(Entities.Enums.UserRole.ADMINISTRATOR))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool UserIsInRole(User user, UserRole userRole)
        {
            if (user.Role.HasValue && user.Role.Value.HasFlag(userRole))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<IEnumerable<User>> GetAllUsers()
        {
            return await this.DataContext.Users.Find(_ => true).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByOsmIds(string[] osmIds)
        {
            return await this.DataContext.Users.Find(u => osmIds.Contains(u.OsmId)).ToListAsync();
        }

        public async Task<User> GetUserById(string osmId)
        {
            return await this.SelectAsync(osmId);
        }

        public async Task<User> EditUserAsync(User user)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();
            var oldUser = await this.SelectAsync(user.OsmId);
            try
            {
                session.StartTransaction();

                oldUser.OsmId = user.OsmId;
                oldUser.Name = user.Name;
                oldUser.Email = user.Email;
                oldUser.Role = user.Role;
                await this.DataContext.Users.FindOneAndReplaceAsync(u => u.OsmId == oldUser.OsmId, oldUser);
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }

            return oldUser;
        }

        public async Task StartMissionAsync(MissionProgress mission, string userId)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();

                User user = await this.SelectAsync(userId);

                user.MissionProgress = mission;

                await this.DataContext.Users.FindOneAndReplaceAsync(x => x.Id == user.Id, user);

                if (mission == null)
                {
                    await this.UserNotify.SendErrorNotif(userId, $"La mission a été abandonné");
                }
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }
        }
    }
}