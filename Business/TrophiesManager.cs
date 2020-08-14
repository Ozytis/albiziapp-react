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
        public TrophiesManager(DataContext dataContext) : base(dataContext)
        {

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
    }
}
