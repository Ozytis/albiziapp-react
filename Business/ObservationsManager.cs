using Entities;
using MongoDB.Driver;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business
{
    public class ObservationsManager : BaseManager
    {
        public FileManager FileManager { get; }
        public SpeciesManager SpeciesManager { get; }
        public UsersManager UsersManager { get; }

        public ObservationsManager(DataContext dataContext, FileManager fileManager,
            SpeciesManager speciesManager, UsersManager usersManager)
            : base(dataContext)
        {
            this.FileManager = fileManager;
            this.SpeciesManager = speciesManager;
            this.UsersManager = usersManager;
        }

        public async Task<IEnumerable<Observation>> GetAllObservations()
        {
            return await this.DataContext.Observations.Find(_ => true).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserObservations(string userId)
        {
            return await this.DataContext.Observations.Find(obs => obs.UserId == userId).ToListAsync();
        }

        public async Task<Observation> CreateObservationAsync(Observation newObservation, string[] pictures)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

            try
            {
                session.StartTransaction();
                newObservation.Id = Guid.NewGuid().ToString("N");
                newObservation.Pictures = new List<string>();

                if (!string.IsNullOrEmpty(newObservation.Genus))
                {
                    newObservation.CommonGenus = (await this.SpeciesManager
                        .GetSpeciesByGenusAsync(newObservation.Genus))
                        .FirstOrDefault()?.CommonGenus;
                }

                if (!string.IsNullOrEmpty(newObservation.SpeciesName))
                {
                    Species species = await this.SpeciesManager
                       .GetSpeciesByNameAsync(newObservation.SpeciesName);

                    newObservation.CommonSpeciesName = species?.CommonSpeciesName;
                    newObservation.TelaBotanicaTaxon = species?.TelaBotanicaTaxon;
                }

                User user = await this.UsersManager.SelectAsync(newObservation.UserId);
                newObservation.AuthorName = user?.Name;

                foreach (string picture in pictures.Where(p => !string.IsNullOrEmpty(p)))
                {
                    newObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", picture));
                }

                await this.DataContext.Observations.InsertOneAsync(newObservation);

                // TODO: calculer les points
                // TODO: mettre à jour la mission

            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }

            return newObservation;
        }

        public async Task DeleteObservationAsync(string observationId, string currentUserId)
        {
            Observation observation = await this.DataContext.Observations.Find(o => o.Id == observationId).FirstOrDefaultAsync();

            if (observation.UserId != currentUserId)
            {
                throw new BusinessException("Vous n'avez pas le droit de supprimer ce relevé");
            }

            await this.DataContext.Observations.DeleteOneAsync(o => o.Id == observationId);
        }
    }
}
