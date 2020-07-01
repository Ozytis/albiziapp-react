using Entities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business
{
    public class SpeciesManager : BaseManager
    {
        public FileManager FileManager { get; }

        public SpeciesManager(DataContext dataContext, FileManager fileManager)
            : base(dataContext)
        {
            this.FileManager = fileManager;
        }

        public async Task<IEnumerable<Species>> GetAllSpeciesAsync()
        {
            return await this.DataContext.Species.Find(_ => true).ToListAsync();
        }

        public async Task<IEnumerable<FloraKey>> GetAllFloraKeysAsync()
        {
            return await this.DataContext.FloraKeys.Find(_ => true).ToListAsync();
        }

        public async Task<Species> SelectByTaxonAsync(string taxon)
        {
            return await this.DataContext.Species.Find(s => s.TelaBotanicaTaxon == taxon).FirstOrDefaultAsync();
        }

        public async Task CreateOrUpdateSpeciesAsync(Species species, string[] pictures)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();

                Species existing = await this.SelectByTaxonAsync(species.TelaBotanicaTaxon);

                if (existing != null)
                {
                    await this.DataContext.Species.DeleteOneAsync(s => s.TelaBotanicaTaxon == species.TelaBotanicaTaxon);
                }

                species.Id = Guid.NewGuid().ToString("N");

                species.Pictures = new List<string>();

                foreach (string picture in pictures)
                {
                    species.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("species", picture));
                }

                await this.DataContext.Species.InsertOneAsync(species);

                await session.CommitTransactionAsync();
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }
        }

        public async Task<Species> GetSpeciesByNameAsync(string speciesName)
        {
            return await this.DataContext.Species.Find(s => s.SpeciesName == speciesName).FirstOrDefaultAsync();
        }

        public async Task CreateOrUpdateFloraKeyAsync(FloraKey floraKey, FloraKeyValue[] floraKeyValues)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();
                await session.CommitTransactionAsync();

                IFindFluent<FloraKey, FloraKey> existing = this.DataContext.FloraKeys.Find(key => key.NormalizedForm == floraKey.NormalizedForm);

                if (existing != null)
                {
                    await this.DataContext.FloraKeys.DeleteOneAsync(key => key.NormalizedForm == floraKey.NormalizedForm);
                }

                floraKey.Id = Guid.NewGuid().ToString("N");
                floraKey.Values = new List<FloraKeyValue>();

                foreach (FloraKeyValue value in floraKeyValues)
                {
                    value.FloraKeyId = floraKey.Id;
                    floraKey.Values.Add(value);
                }

                await this.DataContext.FloraKeys.InsertOneAsync(floraKey);
            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Species>> GetSpeciesByGenusAsync(string genus)
        {
            return await this.DataContext.Species.Find(s => s.Genus == genus).ToListAsync();
        }
    }
}