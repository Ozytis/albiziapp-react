using Entities;
using MongoDB.Driver;
using System.Linq;
using System.Threading.Tasks;

namespace Business
{
    public class UsersManager : BaseManager
    {
        public UsersManager(DataContext dataContext, TitlesManager titlesManager) : base(dataContext)
        {
            this.TitlesManager = titlesManager;
        }

        public TitlesManager TitlesManager { get; }

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


        public async Task AddExploraitonPoints(string userId, int points)
        {
            var user = await this.SelectAsync(userId);
            if(user == null)
            {
                return;
            }

            user.ExplorationPoints += points;
            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
        }


        public async Task AddKnowledegePoints(string userId, int points)
        {
            var user = await this.SelectAsync(userId);
            if (user == null)
            {
                return;
            }

            user.KnowledgePoints += points;

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
            if(titles != null && titles.Count > 0)
            {
                if(user.Titles == null)
                {
                    user.Titles = titles.Select(t => t.Id).ToArray();
                }
                else
                {              
                    var titlesToAdd = titles.Where(t => !user.Titles.Any(ut => ut == t.Id)).Select(t => t.Id).ToList();
                    user.Titles = user.Titles.Concat(titlesToAdd).ToArray();
                }
                await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
            }

        }

    }
}
