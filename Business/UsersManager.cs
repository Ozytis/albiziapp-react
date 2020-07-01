using Entities;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace Business
{
    public class UsersManager : BaseManager
    {
        public UsersManager(DataContext dataContext) : base(dataContext)
        {
        }

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
    }
}
