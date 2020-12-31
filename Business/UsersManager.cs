using Common;
using Entities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business
{
    public class UsersManager : BaseManager
    {
        public UsersManager(DataContext dataContext, TitlesManager titlesManager, MissionsManager missionsManager, TrophiesManager trophiesManager, IUserNotify userNotify) : base(dataContext)
        {
            this.TitlesManager = titlesManager;
            this.MissionsManager = missionsManager;
            this.TrophiesManager = trophiesManager;
            this.UserNotify = userNotify;

        }
        public IUserNotify UserNotify { get; }
        public TitlesManager TitlesManager { get; }

        public MissionsManager MissionsManager { get; }

        public TrophiesManager TrophiesManager { get; }

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
                Name = userName
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

        public async Task AddTrophies(string userId)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }
            var trophies = await this.TrophiesManager.GetTrophiesBySuccessActivitiesCount(user.MissionCompleted?.Sum(x => x.ActivitiesCompleted.Count()) ?? 0);
            if (trophies != null && trophies.Count > 0)
            {
                if (user.Trophies == null)
                {
                    user.Trophies = trophies.Select(t => t.Id).ToArray();
                }
                else
                {
                    var trophiesToAdd = trophies.Where(t => !user.Trophies.Any(ut => ut == t.Id)).Select(t => t.Id).ToList();

                    user.Trophies = user.Trophies.Concat(trophiesToAdd).ToArray();
                }

                await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
            }


            await this.UserNotify.SendNotif(userId, "Vous avez debloqué un nouveau trophée !");

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

        public async Task EndCurrentActivity(string userId)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }

            var missionsCompleted = user.MissionCompleted?.ToList() ?? new List<MissionComplete>();
            MissionComplete missionComplete = missionsCompleted?.FirstOrDefault(m => m.IdMission == user.MissionProgress.MissionId);
            Mission mission = await this.MissionsManager.GetMissionById(user.MissionProgress.MissionId);
            List<ActivityComplete> activities;
            if (missionComplete == null)
            {
                missionComplete = new MissionComplete
                {
                    IdMission = user.MissionProgress.MissionId
                };
                activities = new List<ActivityComplete>();
            }
            else
            {
                activities = missionComplete.ActivitiesCompleted.ToList();
            }

            activities.Add(new ActivityComplete { CompletedDate = DateTime.UtcNow, IdActivity = user.MissionProgress.ActivityId });

            if (activities.Count() == mission.Activities.Count())
            {
                missionComplete.CompletedDate = DateTime.UtcNow;
            }

            missionComplete.ActivitiesCompleted = activities.ToArray();


            if (missionsCompleted == null)
            {
                missionsCompleted = new List<MissionComplete>();
                missionsCompleted.Add(missionComplete);
            }
            else
            {
                var missionsCompletedIndex = missionsCompleted.FindIndex(m => m.IdMission == missionComplete.IdMission);
                if (missionsCompletedIndex != -1)
                {
                    missionsCompleted[missionsCompletedIndex] = missionComplete;
                }
                else
                {
                    missionsCompleted.Add(missionComplete);
                }
            }

            user.MissionCompleted = missionsCompleted.ToArray();
            if (missionComplete.CompletedDate.HasValue)
            {
                var missions = await this.MissionsManager.GetAllMissionsAsync();
                var nextMission = missions.FirstOrDefault(x => x.Order > mission.Order);
                if (nextMission != null)
                {
                    user.MissionProgress = new MissionProgress { MissionId = nextMission.Id, ActivityId = nextMission.Activities.OrderBy(x => x.Order).FirstOrDefault()?.Id, StartDate = DateTime.UtcNow };
                }
                else
                {
                    user.MissionProgress = null;
                }
            }
            else
            {
                var nextActivity = mission.Activities.FirstOrDefault(a => a.Order > mission.Activities.First(x => x.Id == user.MissionProgress.ActivityId).Order);
                if (nextActivity != null)
                {
                    user.MissionProgress = new MissionProgress { MissionId = mission.Id, ActivityId = nextActivity.Id, StartDate = DateTime.UtcNow };
                }
                else
                {
                    user.MissionProgress = null;
                }
            }

            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);

            await this.AddTrophies(user.OsmId);
        }

        public async Task StartFirstMission(string userId)
        {
            var user = await this.SelectAsync(userId);
            if (user == null || user.MissionProgress != null)
            {
                return;
            }

            var missions = await this.MissionsManager.GetAllMissionsAsync();
            var nextMission = missions.FirstOrDefault();
            if (nextMission != null)
            {
                user.MissionProgress = new MissionProgress { MissionId = nextMission.Id, ActivityId = nextMission.Activities.OrderBy(x => x.Order).FirstOrDefault()?.Id, StartDate = DateTime.UtcNow };
            }

            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);

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
        public async Task<IEnumerable<User>> GetAllUsers()
        {
            return await this.DataContext.Users.Find(_ => true).ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByOsmIds(string[] osmIds)
        {
            return await this.DataContext.Users.Find(u => osmIds.Contains(u.OsmId)).ToListAsync();
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
    }
}
