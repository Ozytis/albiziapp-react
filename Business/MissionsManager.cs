using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace Business
{
    public class MissionsManager : BaseManager
    {
        public MissionsManager(DataContext dataContext) : base(dataContext)
        {

        }

        public async Task<IEnumerable<Mission>> GetAllMissionsAsync()
        {
            return await this.DataContext.Missions.Find(_ => true).ToListAsync();
        }

        public async Task CreateMissionAsync(Mission mission)
        {
            using var session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();

                mission.Id = Guid.NewGuid().ToString("N");

                await this.DataContext.Missions.InsertOneAsync(mission);
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }

        }
    }
}
