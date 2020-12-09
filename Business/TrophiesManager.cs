using Common;
using Entities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class TrophiesManager : BaseManager
    {

        public IUserNotify UserNotify { get; }
        public TrophiesManager(DataContext dataContext, IUserNotify userNotify) : base(dataContext)
        {

            this.UserNotify = userNotify;
        }

        public async Task CreateTrophyAsync(Trophy trophy)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();

                trophy.Id = Guid.NewGuid().ToString("N");

                await this.DataContext.Trophies.InsertOneAsync(trophy);
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }
        }

        public async Task<List<Trophy>> GetTrophiesBySuccessActivitiesCount(int count)
        {
            return await this.DataContext.Trophies.Find(s => s.CountSuccessFullActivities <= count).ToListAsync();
        }

        public async Task<List<Trophy>> GetAllTrophiesAsync()
        {
            return await this.DataContext.Trophies.Find(_ => true).ToListAsync();
        }
    }
}
