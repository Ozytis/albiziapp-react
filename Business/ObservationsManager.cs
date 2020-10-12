using Business.MissionValidation;
using Common;
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
        public IServiceProvider ServiceProvider { get; }

        public IUserNotify UserNotify { get; }

        public ObservationsManager(DataContext dataContext, FileManager fileManager,
            SpeciesManager speciesManager, UsersManager usersManager, IServiceProvider serviceProvider, IUserNotify userNotify)
            : base(dataContext)
        {
            this.FileManager = fileManager;
            this.SpeciesManager = speciesManager;
            this.UsersManager = usersManager;
            this.ServiceProvider = serviceProvider;
            this.UserNotify = userNotify;
        }

        public async Task<IEnumerable<Observation>> GetAllObservations()
        {
            return await this.DataContext.Observations.Find(_ => true).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserObservations(string userId)
        {
            return await this.DataContext.Observations.Find(obs => obs.UserId == userId).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserVerifyObservations(string userId)
        {
            return await this.DataContext.Observations.Find(obs => obs.History[0] != null && obs.History[0].UserId != userId &&
            (obs.UserId == userId || obs.History != null && obs.History.Any(x => x.UserId == userId))).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserIdentifyObservations(string userId)
        {
            return await this.DataContext.Observations.Find(obs => obs.IsIdentified && obs.History[0] != null && obs.History[0].UserId != userId &&
            (obs.UserId == userId || obs.History != null && obs.History.Any(x => x.UserId == userId))).ToListAsync();
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
                newObservation.Date = DateTime.UtcNow;
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

                if(user.Role.HasValue && user.Role.Value.HasFlag( Entities.Enums.UserRole.EXPERT))
                {
                    newObservation.IsIdentified = true;
                }


                await this.DataContext.Observations.InsertOneAsync(newObservation);

                await this.AddExplorationPointsForNewObservation(newObservation);
                                              

                var validator = await MissionValidator.GetValidatorFromActivity(this.ServiceProvider, user);
                await validator.UpdateActivityProgression();

            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }





            

            return newObservation;
        }

        public async Task AddExplorationPointsForNewObservation(Observation observation)
        {
            // 1 point pour l'ajout d'un relevé           
            var currentDate = DateTime.UtcNow;
            var pointHistory = new List<PointHistory>();
            pointHistory.Add(new PointHistory { Point = 1, Type = (int)ExplorationPoint.CreateObservation, Date = currentDate });
            if (observation.Pictures != null && observation.Pictures.Count > 0)
            {
                //2 points pour une photos
                pointHistory.Add(new PointHistory { Point = 2, Type = (int)ExplorationPoint.TakePictureTree, Date = currentDate });
            }

            if (!string.IsNullOrEmpty(observation.SpeciesName) || !string.IsNullOrEmpty(observation.CommonSpeciesName))
            {
                //6 points pour le nom de l'espèce
                pointHistory.Add(new PointHistory { Point = 6, Type = (int)ExplorationPoint.CompleteSpecies, Date = currentDate });
            }

            if (!string.IsNullOrEmpty(observation.Genus) || !string.IsNullOrEmpty(observation.CommonGenus))
            {
                //3 points pour le genre de l'espèce
                pointHistory.Add(new PointHistory { Point = 3, Type = (int)ExplorationPoint.CompleteGenus, Date = currentDate });                
            }

            await this.UsersManager.AddExplorationPoints(observation.UserId, pointHistory);
            await this.UsersManager.AddTitles(observation.UserId);

        }

        public async Task CalculateKnowledegePoints(Observation newObservation)
        {
            BaseObservation compareObservation = newObservation.History.LastOrDefault();
            var pointHistory = new List<PointHistory>();
            var currentDate = DateTime.UtcNow;
            if (newObservation.IsIdentified)
            {
                if (newObservation.Genus == compareObservation.Genus)
                {
                    pointHistory.Add(new PointHistory { Point = 10, Type = (int)KnowledgePoint.GenusIdentify, Date = currentDate });
                }

                if (newObservation.SpeciesName == compareObservation.SpeciesName || newObservation.CommonSpeciesName == compareObservation.CommonSpeciesName)
                {
                    pointHistory.Add(new PointHistory { Point = 15, Type = (int)KnowledgePoint.SpeciesIdentify, Date = currentDate });
                }
                await this.UsersManager.AddKnowledegePoints(newObservation.UserId, pointHistory);
                await this.UsersManager.AddTitles(newObservation.UserId);
            }
            else
            {
                if (newObservation.History != null && newObservation.History.Count == 1)
                {
                    if (newObservation.Genus == compareObservation.Genus)
                    {
                        pointHistory.Add(new PointHistory { Point = 4, Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                    }

                    if (newObservation.SpeciesName == compareObservation.SpeciesName || newObservation.CommonSpeciesName == compareObservation.CommonSpeciesName)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                    }
                    if (newObservation.Confident)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                    }
                    await this.UsersManager.AddKnowledegePoints(compareObservation.UserId, pointHistory);
                    await this.UsersManager.AddTitles(compareObservation.UserId);
                }
                else
                {
                    if (newObservation.History != null && newObservation.History.Count > 1)
                    {                
                        var pointHistoryP0 = new List<PointHistory>();
                        var pointHistoryPb = new List<PointHistory>();
                        bool speciesPnToP0Isvalid = false;
                        bool genusPnToP0Isvalid = false;

                        // compareObservation = Pb
                        // compareHistory = P0
                        // newObservation = Pn
                        foreach (var compareHistory in newObservation.History)
                        {

                            if (newObservation.Genus == compareHistory.Genus)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = (!speciesPnToP0Isvalid ? 4 : 2), Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                                genusPnToP0Isvalid = true;
                            }


                            if (newObservation.SpeciesName == compareHistory.SpeciesName || newObservation.CommonSpeciesName == compareHistory.CommonSpeciesName)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = (!speciesPnToP0Isvalid ? 2 : 1), Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                                speciesPnToP0Isvalid = true;
                            }

                            if (newObservation.Confident)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });                          
                            }

                            await this.UsersManager.AddKnowledegePoints(compareHistory.UserId, pointHistoryP0);
                            await this.UsersManager.AddTitles(compareHistory.UserId);
                        }

                        if (newObservation.Genus == compareObservation.Genus)
                        {
                            pointHistoryPb.Add(new PointHistory { Point = (!genusPnToP0Isvalid ? 4 : 2), Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                        }

                        if (newObservation.SpeciesName == compareObservation.SpeciesName || newObservation.CommonSpeciesName == compareObservation.CommonSpeciesName)
                        {
                            pointHistoryPb.Add(new PointHistory { Point = (!genusPnToP0Isvalid ? 2 : 1), Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                        }
                        if (newObservation.Confident)
                        {
                            pointHistoryPb.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                        }

                        await this.UsersManager.AddKnowledegePoints(compareObservation.UserId, pointHistoryPb);
                        await this.UsersManager.AddTitles(compareObservation.UserId);
                    }

                }
            }
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
                if (existingObservation.History == null)
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
                existingObservation.UpdateDate = DateTime.UtcNow;
                if (pictures?.Length > 0)
                {
                    if (existingObservation.Pictures == null)
                    {
                        existingObservation.Pictures = new List<string>();
                    }
                    foreach (var existingPictures in existingObservation.Pictures)
                    {
                        await this.FileManager.DeleteFile(existingPictures);
                    }
                    existingObservation.Pictures.Clear();

                    foreach (string picture in pictures.Where(p => !string.IsNullOrEmpty(p)))
                    {
                        existingObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", picture));
                    }
                }

                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);

                await this.CalculateKnowledegePoints(existingObservation);
                // TODO: mettre à jour la mission
                var validator = await MissionValidator.GetValidatorFromActivity(this.ServiceProvider, user);
                await validator.UpdateActivityProgression();

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

            if (observation.Validations == null)
            {
                observation.Validations = new List<ObservationValidation>();
            }

            if (!observation.Validations.Any(v => v.OsmId == currentUserId))
            {
                observation.Validations.Add(new ObservationValidation { OsmId = currentUserId, ValidationDate = DateTime.UtcNow });
                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == observation.Id, observation);

                //on reprend le fonctionnement de l'edition d'une observation, pour refaire le processus de validation des points...
                await this.EditObservationAsync(observation, null, currentUserId);
            }
        }


        private BaseObservation CloneObservationToBaseObservation(Observation observation)
        {
            var serializeObservation = JsonSerializer.Serialize<BaseObservation>(observation);
            return JsonSerializer.Deserialize<BaseObservation>(serializeObservation);
        }

    }
}
