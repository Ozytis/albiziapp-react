using Entities;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
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

        public async Task<Observation> GetUserObservationbyId(string observationId)
        {
            return await this.DataContext.Observations.Find(obs => obs.Id == observationId).FirstOrDefaultAsync();
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

                //await this.CalculateExploraitonPointsForNewObservation(newObservation);
                // TODO: mettre à jour la mission

            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }

            return newObservation;
        }

        public async Task AddExploraitonPointsForNewObservation(Observation observation)
        {
            // 1 point pour l'ajout d'un relevé
            var pointsToAdd = 1;

            if (observation.Pictures != null && observation.Pictures.Count > 0)
            {
                //2 points pour une photos
                pointsToAdd = +2;
            }

            if (!string.IsNullOrEmpty(observation.SpeciesName) || !string.IsNullOrEmpty(observation.CommonSpeciesName))
            {
                //6 points pour le nom de l'espèce
                pointsToAdd = +6;
            }

            if (!string.IsNullOrEmpty(observation.Genus) || !string.IsNullOrEmpty(observation.CommonGenus))
            {
                //3 points pour le genre de l'espèce
                pointsToAdd = +3;
            }

            await this.UsersManager.AddExploraitonPoints(observation.UserId, pointsToAdd);
            await this.UsersManager.AddTitles(observation.UserId);
        }

        public async Task CalculateKnowledegePointsForNewObersvation(Observation newObservation, Observation compareObservation)
        {
            int pointsToAdd = 0;
            if (compareObservation.IsIdentified)
            {
                if (newObservation.Genus == compareObservation.Genus)
                {
                    pointsToAdd = +10;
                }

                if (newObservation.SpeciesName == compareObservation.SpeciesName || newObservation.CommonSpeciesName == compareObservation.CommonSpeciesName)
                {
                    pointsToAdd = +15;
                }
            }

            await this.UsersManager.AddKnowledegePoints(newObservation.UserId, pointsToAdd);
            await this.UsersManager.AddTitles(newObservation.UserId);
        }



        public async Task<Observation> EditObservationAsync(Observation editObservation, string[] pictures, string currentUserId)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();
            var existingObservation = await this.GetUserObservationbyId(editObservation.Id);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
           
            try
            {
                session.StartTransaction();
                if(existingObservation.History == null)
                {
                    existingObservation.History = new List<BaseObservation>();
                }
                //si ce n'est pas le même utilisateur alors on passe l'observation en historique
                if (existingObservation.UserId != currentUserId)
                {
                    existingObservation.History.Add(this.CloneObservationToBaseObservation(existingObservation));
                }             
                

                if (!string.IsNullOrEmpty(editObservation.Genus))
                {
                    existingObservation.CommonGenus = (await this.SpeciesManager
                        .GetSpeciesByGenusAsync(editObservation.Genus))
                        .FirstOrDefault()?.CommonGenus;
                }

                if (!string.IsNullOrEmpty(editObservation.SpeciesName))
                {
                    Species species = await this.SpeciesManager
                       .GetSpeciesByNameAsync(editObservation.SpeciesName);

                    existingObservation.CommonSpeciesName = species?.CommonSpeciesName;
                    existingObservation.TelaBotanicaTaxon = species?.TelaBotanicaTaxon;
                }

                User user = await this.UsersManager.SelectAsync(editObservation.UserId);
                existingObservation.UserId = editObservation.UserId;
                existingObservation.AuthorName = user?.Name;
                existingObservation.Confident = editObservation.Confident;
                if (pictures.Length > 0)
                {
                    if(existingObservation.Pictures == null)
                    {
                        existingObservation.Pictures = new List<string>();
                    }
                    foreach (var existingPictures in existingObservation.Pictures)
                    {
                        this.FileManager.DeleteFile(existingPictures);
                    }
                    existingObservation.Pictures.Clear();

                    foreach (string picture in pictures.Where(p => !string.IsNullOrEmpty(p)))
                    {
                        existingObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", picture));
                    }
                }


               



                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);

                // TODO: calculer les points
                // TODO: mettre à jour la mission

            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }

            return existingObservation;
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

        public async Task VaidateObservationAsync(string observationId, string currentUserId)
        {
            Observation observation = await this.DataContext.Observations.Find(o => o.Id == observationId).FirstOrDefaultAsync();

            if(observation.Validations == null)
            {
                observation.Validations = new List<ObervationValidation>();
            }

            if(!observation.Validations.Any(v => v.OsmId == currentUserId))
            {
                observation.Validations.Add(new ObervationValidation { OsmId = currentUserId, ValidationDate = DateTime.UtcNow });
                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == observation.Id, observation);
            }
   
        }


        private BaseObservation CloneObservationToBaseObservation(Observation observation)
        {
            var serializeObservation =  JsonSerializer.Serialize<BaseObservation>(observation);
            return JsonSerializer.Deserialize<BaseObservation>(serializeObservation);
        }
    }
}
