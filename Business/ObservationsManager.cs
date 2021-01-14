using Api;
using Business.Extensions;
using Business.MissionValidation;
using Common;
using Entities;
using Entities.Enums;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
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

        public IConfiguration Configuration;

        public ObservationsManager(DataContext dataContext, FileManager fileManager,
            SpeciesManager speciesManager, UsersManager usersManager, IServiceProvider serviceProvider, IUserNotify userNotify, IConfiguration configuration)
            : base(dataContext)
        {
            this.FileManager = fileManager;
            this.SpeciesManager = speciesManager;
            this.UsersManager = usersManager;
            this.ServiceProvider = serviceProvider;
            this.UserNotify = userNotify;
            this.Configuration = configuration;
        }

        public async Task<IEnumerable<Observation>> GetAllObservations()
        {
            return await this.DataContext.Observations.Find(_ => true).ToListAsync();
        }
        public async Task<IEnumerable<Observation>> GetNearestObservations(double latitude, double longitude)
        {
            var collection = this.DataContext.Observations;
            var point = GeoJson.Point(GeoJson.Geographic(longitude, latitude));            
            var filter = Builders<Observation>.Filter.Near(o => o.Coordinates, point, 15 * 1000);

            return await collection.Find(filter).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserObservations(string userId)
        {
            return await this.DataContext.Observations.Find(obs => obs.UserId == userId).ToListAsync();
        }

        public string[] GetAllUserIdForObservation(Observation obs)
        {
            List<string> ids = new List<string>();
            //ids.Add(obs.UserId);
            ids.AddRange(obs.ObservationStatements.Select(s => s.UserId)); 
         
            return ids.Distinct().ToArray();
        }
        public async Task<IEnumerable<Observation>> GetUserVerifyObservations(string userId)
        {
            //TODO ajouter code, pour statement confirmation...
            return await this.DataContext.Observations.Find(obs => obs.ObservationStatements.Count > 0 && obs.ObservationStatements[0].UserId != userId &&
            (obs.UserId == userId || obs.ObservationStatements != null && obs.ObservationStatements.Any(x => x.UserId == userId))).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserIdentifyObservations(string userId)
        {
            //TODO ajouter code, pour statement confirmation...
            return await this.DataContext.Observations.Find(obs => obs.IsIdentified && obs.ObservationStatements.Count > 0 && obs.ObservationStatements[0].UserId != userId &&
            (obs.UserId == userId || obs.ObservationStatements != null && obs.ObservationStatements.Any(x => x.UserId == userId))).ToListAsync();
        }

        public async Task<Observation> GetUserObservationbyId(string observationId)
        {
            return await this.DataContext.Observations.Find(obs => obs.Id == observationId).FirstOrDefaultAsync();
        }
        public async Task<Observation> GetObservationbyId(string observationId)
        {
            return await this.DataContext.Observations.Find(obs => obs.Id == observationId).FirstOrDefaultAsync();
        }
        public async Task<Observation> CreateObservationAsync(string speciesName, string genus, string userid, Confident? confident, double latitude, double longitude, string[] pictures)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();
            Observation newObservation = new Observation();
            try
            {
                session.StartTransaction();

                newObservation.Id = Guid.NewGuid().ToString("N");
                newObservation.Pictures = new List<string>();
                newObservation.Date = DateTime.UtcNow;
                newObservation.TreeSize = TreeSize.MoreThan10m;

                var statement = new ObservationStatement();
                statement.Id = Guid.NewGuid().ToString("N");
                User user = await this.UsersManager.SelectAsync(userid);
                newObservation.UserId = user.OsmId;
                statement.UserId = user.OsmId;
                newObservation.AuthorName = user?.Name;
                newObservation.ObservationStatements = new List<ObservationStatement>();

                newObservation.Coordinates = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(longitude, latitude));
               

                if (!string.IsNullOrEmpty(genus))
                {
                    var s = (await this.SpeciesManager
                        .GetSpeciesByGenusAsync(genus))
                        .FirstOrDefault();
                    statement.CommonGenus = s?.CommonGenus;
                    statement.Genus = s?.Genus;
                    if (string.IsNullOrEmpty(speciesName))
                    {
                        statement.Expertise = await this.CalculateUserGenusExpertise(user.OsmId, statement.Genus);
                    }
                }

                if (!string.IsNullOrEmpty(speciesName))
                {
                    Species species = await this.SpeciesManager
                       .GetSpeciesByNameAsync(speciesName);

                    statement.CommonSpeciesName = species?.CommonSpeciesName;
                    statement.SpeciesName = species.SpeciesName;
                    statement.TelaBotanicaTaxon = species?.TelaBotanicaTaxon;
                    statement.Expertise = await this.CalculateUserSpeciesExpertise(user.OsmId, speciesName);
                }
                statement.Date = DateTime.UtcNow;
                statement.TotalScore = statement.CalculateReliabilityStatement();
                statement.TotalScoreSpecies = statement.CalculateSpeciesReliabilityStatement();
                statement.Order = 1;
                statement.Confident = confident;
                newObservation.ObservationStatements.Add(statement);

                //if(user.Role.HasValue && user.Role.Value.HasFlag( Entities.Enums.UserRole.EXPERT))
                //{
                //    newObservation.IsIdentified = true;
                //}


                if (pictures != null)
                {
                    foreach (string picture in pictures?.Where(p => !string.IsNullOrEmpty(p)))
                    {
                        newObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", picture));
                    }
                }

                await this.DataContext.Observations.InsertOneAsync(newObservation);
                //TODO VALidATE 
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
        //POUR VALIDER UNE PROPOSITION EXISTANTE
        public async Task ConfirmStatement(string observationId, string statementId, string userId, bool isOnlyGenus)
        {
            //TODO add confident
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }

            var statement = existingObservation.ObservationStatements.FirstOrDefault(x => x.Id == statementId);
            if (statement == null)
            {
                throw new BusinessException("Cette propostion n'existe pas");
            }

            if (existingObservation.ObservationStatements.Any(s => s.ObservationStatementConfirmations != null && s.ObservationStatementConfirmations.Any(c => c.UserId == userId)))
            {
                throw new BusinessException("Vous avez déjà validé une proposition pour ce relevé");
            }

            if (statement.ObservationStatementConfirmations == null)
            {
                statement.ObservationStatementConfirmations = new List<ObservationStatementConfirmation>();
            }

            var confirmation = new ObservationStatementConfirmation()
            {
                Id = Guid.NewGuid().ToString("N"),
                Date = DateTime.UtcNow,
                UserId = userId,
                Expertise = !isOnlyGenus ? await this.CalculateUserSpeciesExpertise(userId, statement.SpeciesName) : await this.CalculateUserGenusExpertise(userId, statement.Genus),
                IsOnlyGenus = isOnlyGenus
            };
            statement.ObservationStatementConfirmations.Add(confirmation);
            statement.TotalScore = statement.CalculateReliabilityStatement();
            statement.TotalScoreSpecies = statement.CalculateSpeciesReliabilityStatement();
            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
            await this.CalculateKnowledegePoints(observationId, statementId, confirmation.Id);
            await this.CheckObservationIsIdentify(existingObservation.Id);

            //TODO voir calcul de points
        }

        //AJOUT D'UNE PROPOSITION
        public async Task AddStatement(string observationId, ObservationCreationModel newStatement, string userId)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }

            var statement = new ObservationStatement();
            statement.Id = Guid.NewGuid().ToString("N");
           // User user = await this.UsersManager.SelectAsync(newStatement.UserId);
            statement.UserId = userId;
            statement.Date = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(newStatement.Genus))
            {
                var s = (await this.SpeciesManager
                    .GetSpeciesByGenusAsync(newStatement.Genus))
                    .FirstOrDefault();
                statement.CommonGenus = s?.CommonGenus;
                statement.Genus = s?.Genus;
            }

            if (!string.IsNullOrEmpty(newStatement.Species))
            {
                Species species = await this.SpeciesManager
                   .GetSpeciesByNameAsync(newStatement.Species);

                statement.CommonSpeciesName = species?.CommonSpeciesName;
                statement.SpeciesName = species.SpeciesName;
                statement.TelaBotanicaTaxon = species?.TelaBotanicaTaxon;
                statement.Expertise = await this.CalculateUserSpeciesExpertise(userId, newStatement.Species);
            }

            if (existingObservation.ObservationStatements.Any(s => s.SpeciesName == statement.SpeciesName && s.Genus == statement.Genus))
            {
                throw new BusinessException("Une proposition identique existe déjà");
            }
            statement.TotalScore = statement.CalculateReliabilityStatement();
            statement.Order = existingObservation.ObservationStatements.Count() + 1;

            statement.TotalScore = statement.CalculateReliabilityStatement();
            existingObservation.ObservationStatements.Add(statement);
            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
            await this.CalculateKnowledegePoints(observationId, statement.Id, null);
            await this.CheckObservationIsIdentify(existingObservation.Id);
        }
        public async Task AddPictures(string observationId, string[] pictures)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }

            foreach(string pic in pictures?.Where(p => !string.IsNullOrEmpty(p)))
            {
                existingObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", pic));
            }

            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
        }
        public async Task CheckObservationIsIdentify(string observationId)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            var minScore = int.Parse(this.Configuration["Reliability:MinimunScore"]);
            var minPercent = int.Parse(this.Configuration["Reliability:MinimunPercent"]);
            var totalSpeciesStatementsScore = existingObservation.ObservationStatements.Sum(x => x.TotalScoreSpecies);
            ObservationStatement identifyStatement = null;
            if (totalSpeciesStatementsScore != 0)
            {
                foreach (var s in existingObservation.ObservationStatements)
                {

                    if (s.TotalScore >= minScore)
                    {
                        var percent = s.TotalScoreSpecies * 100 / totalSpeciesStatementsScore;
                        if (percent >= minPercent)
                        {
                            //statement identify
                            identifyStatement = s;
                            break;
                        }
                    }
                }
            }
            if (identifyStatement != null)
            {
                existingObservation.IsIdentified = true;
                existingObservation.StatementValidatedId = identifyStatement.Id;
                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
            }
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

            if (!string.IsNullOrEmpty(observation.ObservationStatements[0].SpeciesName) || !string.IsNullOrEmpty(observation.ObservationStatements[0].CommonSpeciesName))
            {
                //6 points pour le nom de l'espèce
                pointHistory.Add(new PointHistory { Point = 6, Type = (int)ExplorationPoint.CompleteSpecies, Date = currentDate });
            }

            if (!string.IsNullOrEmpty(observation.ObservationStatements[0].Genus) || !string.IsNullOrEmpty(observation.ObservationStatements[0].CommonGenus))
            {
                //3 points pour le genre de l'espèce
                pointHistory.Add(new PointHistory { Point = 3, Type = (int)ExplorationPoint.CompleteGenus, Date = currentDate });
            }

            await this.UsersManager.AddExplorationPoints(observation.UserId, pointHistory);
            await this.UsersManager.AddTitles(observation.UserId);

        }

        public async Task CalculateKnowledegePoints(string observationId, string statementId, string confirmId)
        {
            //TODO recoder
            var observation = await this.GetUserObservationbyId(observationId);
            var statement = observation.ObservationStatements.FirstOrDefault(x => x.Id == statementId);
            var confirm = statement.ObservationStatementConfirmations?.Where(x => x.Id == confirmId);

            var pointHistory = new List<PointHistory>();
            var currentDate = DateTime.UtcNow;
            if (observation.IsIdentified && !string.IsNullOrEmpty(observation.StatementValidatedId))
            {
                var validatedStatement = observation.ObservationStatements.FirstOrDefault(x => x.Id == observation.StatementValidatedId);
                if (statement.Genus == validatedStatement.Genus)
                {
                    pointHistory.Add(new PointHistory { Point = 10, Type = (int)KnowledgePoint.GenusIdentify, Date = currentDate });
                }

                if (statement.SpeciesName == validatedStatement.SpeciesName || statement.CommonSpeciesName == validatedStatement.CommonSpeciesName)
                {
                    pointHistory.Add(new PointHistory { Point = 15, Type = (int)KnowledgePoint.SpeciesIdentify, Date = currentDate });
                }
                await this.UsersManager.AddKnowledegePoints(observation.UserId, pointHistory);
                await this.UsersManager.AddTitles(observation.UserId);
            }
            else
            {
                if (observation.ObservationStatements.Count == 2)
                {
                    var otherStatement = observation.ObservationStatements.FirstOrDefault(x => x.Id != statementId);

                    if (statement.Genus == otherStatement.Genus)
                    {
                        pointHistory.Add(new PointHistory { Point = 4, Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                    }

                    if (statement.SpeciesName == otherStatement.SpeciesName || statement.CommonSpeciesName == otherStatement.CommonSpeciesName)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                    }
                    if (statement.Confident.HasValue && statement.Confident.Value == Confident.High)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                    }
                    await this.UsersManager.AddKnowledegePoints(statement.UserId, pointHistory);
                    await this.UsersManager.AddTitles(statement.UserId);
                }
                else
                {
                    if (observation.ObservationStatements.Count > 2)
                    {
                        var pointHistoryP0 = new List<PointHistory>();
                        var pointHistoryPb = new List<PointHistory>();
                        bool speciesPnToP0Isvalid = false;
                        bool genusPnToP0Isvalid = false;

                        // compareObservation = Pb
                        // compareHistory = P0
                        // newObservation = Pn
                        foreach (var compareHistory in observation.ObservationStatements.Where(x => x.Id != statementId))
                        {

                            if (statement.Genus == compareHistory.Genus)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = (!genusPnToP0Isvalid ? 4 : 2), Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                                genusPnToP0Isvalid = true;
                            }


                            if (statement.SpeciesName == compareHistory.SpeciesName || statement.CommonSpeciesName == compareHistory.CommonSpeciesName)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = (!speciesPnToP0Isvalid ? 2 : 1), Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                                speciesPnToP0Isvalid = true;
                            }

                            if (statement.Confident.HasValue && statement.Confident.Value == Confident.High)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                            }

                            await this.UsersManager.AddKnowledegePoints(compareHistory.UserId, pointHistoryP0);
                            await this.UsersManager.AddTitles(compareHistory.UserId);
                        }

                        /* if (statement.Genus == compareObservation.Genus)
                         {
                             pointHistoryPb.Add(new PointHistory { Point = (!genusPnToP0Isvalid ? 4 : 2), Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });
                         }

                         if (statement.SpeciesName == compareObservation.SpeciesName || statement.CommonSpeciesName == compareObservation.CommonSpeciesName)
                         {
                             pointHistoryPb.Add(new PointHistory { Point = (!genusPnToP0Isvalid ? 2 : 1), Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                         }
                         if (statement.Confident.HasValue && statement.Confident.Value == Confident.High)
                         {
                             pointHistoryPb.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                         }
                        */
                        await this.UsersManager.AddKnowledegePoints(statement.UserId, pointHistoryPb);
                        await this.UsersManager.AddTitles(statement.UserId);
                    }
                }
            }
        }

        [Obsolete]
        public async Task<Observation> EditObservationAsync(ObservationStatement editObservation, string currentUserId)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();
            var existingObservation = await this.GetUserObservationbyId(editObservation.Id);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            /*
            try
            {
                session.StartTransaction();
                //if (existingObservation.History == null)
                //{
                //    existingObservation.History = new List<BaseObservation>();
                //}
                ////si ce n'est pas le même utilisateur alors on passe l'observation en historique
                //if (existingObservation.UserId != currentUserId)
                //{
                //    existingObservation.History.Add(this.CloneObservationToBaseObservation(existingObservation));
                //}


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
            */
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

            //TODO VALIDATE VOIR SI on garde
        }

        public async Task<int> CalculateUserSpeciesExpertise(string userId, string speciesName)
        {
            var data = await this.DataContext.Observations.Find(x => x.IsIdentified &&
            x.ObservationStatements.Any(s => s.SpeciesName == speciesName && (s.UserId == userId || s.ObservationStatementConfirmations.Any(c => c.UserId == userId)))).ToListAsync();
            //On filtre via le StatementValidatedId après, car cela n'est pas pris en charge par le drive MongoDb
            data = data.Where(o => o.ObservationStatements.Any(s => s.Id == o.StatementValidatedId)).ToList();

            var count = data.Count;
            var species = await this.SpeciesManager.GetSpeciesByNameAsync(speciesName);
            //TODO voir si on add +1 si besoin
            var expertise = (count * species.Difficult * species.Rarity) +1;
        
            return (int)Math.Min(expertise, 50);
        }
        public async Task<int> CalculateUserGenusExpertise(string userId, string genus)
        {
            var data = await this.DataContext.Observations.Find(x => x.IsIdentified &&
            x.ObservationStatements.Any(s => s.Genus == genus && (s.UserId == userId || s.ObservationStatementConfirmations.Any(c => c.UserId == userId)))).ToListAsync();
            //On filtre via le StatementValidatedId après, car cela n'est pas pris en charge par le drive MongoDb
            data = data.Where(o => o.ObservationStatements.Any(s => s.Id == o.StatementValidatedId)).ToList();

            var count = data.Count;
            //TODO voir si on add +1 si besoin
            var genusDifficult = await this.SpeciesManager.CalculDifficultGenus(genus);
            var genusRarity = await this.SpeciesManager.CalculRarityGenus(genus);
            var expertise = (count * genusDifficult * genusRarity) +1;
        
            return (int)Math.Min(expertise, 50);
        }
        public async Task UpdateTreeSize(string observationId, int treeSize)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            existingObservation.TreeSize = (TreeSize?)treeSize;

            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
        }

        public async Task AddCommentary(string observationId, string newCommentary, string userId)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            var commentary = new ObservationCommentary();

            commentary.Id = Guid.NewGuid().ToString("N");
            commentary.Date = DateTime.UtcNow;
            commentary.Commentary = newCommentary;
            User currentUser = await this.UsersManager.SelectAsync(userId);
            commentary.UserName = currentUser.Name;
            if(existingObservation.ObservationCommentarys == null)
            {
                existingObservation.ObservationCommentarys = new List<ObservationCommentary>();
            }
            existingObservation.ObservationCommentarys.Add(commentary);
            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
        }

        public async Task<Observation> EditObservationStatementAsync(ObservationStatement editStatement, string observationId)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();
            var existingObservation = await this.GetUserObservationbyId(observationId);
            var existingStatement = existingObservation.ObservationStatements.Find(s => s.Id == editStatement.Id);


            if (existingStatement == null )
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            foreach(ObservationStatement os in existingObservation.ObservationStatements)
            {
                if(string.IsNullOrEmpty(os.CommonSpeciesName)||string.IsNullOrEmpty(os.SpeciesName))
                {
                    if(os.Genus==editStatement.Genus && os.CommonGenus == editStatement.CommonGenus)
                    {
                        throw new BusinessException("Ce relevé existe deja");
                    }
                }
                else if(os.CommonSpeciesName==editStatement.CommonSpeciesName && os.SpeciesName == editStatement.SpeciesName)
                {
                    throw new BusinessException("Ce relevé existe deja, vous pouvez le confirmer");
                }
            }
            try
            {
                session.StartTransaction();

                existingStatement.CommonGenus = editStatement.CommonGenus;
                existingStatement.Genus = editStatement.Genus;
                existingStatement.SpeciesName = editStatement.SpeciesName;
                if (!string.IsNullOrEmpty(existingStatement.SpeciesName))
                {
                    Species species = await this.SpeciesManager
                       .GetSpeciesByNameAsync(existingStatement.SpeciesName);

                    existingStatement.CommonSpeciesName = species?.CommonSpeciesName;
                }

                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);

            }
            catch
            {
                await session.AbortTransactionAsync();
                throw;
            }
            
            return existingObservation;
        }
        public async Task DeleteObservationStatementAsync(string observationId, string statementId, string currentUserId)
        {
            Observation observation = await this.DataContext.Observations.Find(o => o.Id == observationId).FirstOrDefaultAsync();
            

            observation.ObservationStatements.Remove(observation.ObservationStatements.Find(o => o.Id == statementId));

            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == observation.Id, observation);
        }
    }
}
