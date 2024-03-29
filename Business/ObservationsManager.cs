﻿using Api;
using Business.Emails;
using Business.Extensions;
using Business.MissionValidation;
using Common;
using Entities;
using Entities.Enums;
using Hangfire;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using Ozytis.Common.Core.Utilities;
using RazorLight;
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

        public IRazorLightEngine RazorEngine { get; }

        public ObservationsManager(DataContext dataContext, FileManager fileManager,
            SpeciesManager speciesManager, UsersManager usersManager, IServiceProvider serviceProvider, IUserNotify userNotify, IConfiguration configuration, IRazorLightEngine razorLightEngine)
            : base(dataContext)
        {
            this.FileManager = fileManager;
            this.SpeciesManager = speciesManager;
            this.UsersManager = usersManager;
            this.ServiceProvider = serviceProvider;
            this.UserNotify = userNotify;
            this.Configuration = configuration;
            this.RazorEngine = razorLightEngine;
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

        public async Task<IEnumerable<Observation>> GetObservationsByIds(string[] observationIds)
        {
            return await this.DataContext.Observations.Find(obs => observationIds.Contains(obs.UserId)).ToListAsync();
        }

        public string[] GetAllUserIdForObservation(Observation obs)
        {
            List<string> ids = new List<string>();
            ids.AddRange(obs.ObservationStatements.Select(s => s.UserId));

            return ids.Distinct().ToArray();
        }

        public async Task<IEnumerable<Observation>> GetUserVerifyObservations(string userId, DateTime date)
        {
            return await this.DataContext.Observations.Find(obs => obs.ObservationStatements.Count > 0 && obs.ObservationStatements[0].UserId != userId &&
            (obs.ObservationStatements != null && (obs.ObservationStatements.Any(x => (x.UserId == userId && x.Date >= date) || (x.ObservationStatementConfirmations != null && x.ObservationStatementConfirmations.Any(c => c.UserId == userId && c.Date >= date)))))).ToListAsync();
        }

        public async Task<IEnumerable<Observation>> GetUserIdentifyObservations(string userId, DateTime date)
        {
            return await this.DataContext.Observations.Find(obs => obs.ObservationStatements.Count > 0 && obs.ObservationStatements[0].UserId != userId &&
            (obs.ObservationStatements != null && (obs.ObservationStatements.Any(x => (x.UserId == userId && x.Date >= date) || (x.ObservationStatementConfirmations != null && x.ObservationStatementConfirmations.Any(c => c.UserId == userId && c.Date >= date)))))).ToListAsync();
        }

        public async Task<Observation> GetUserObservationbyId(string observationId)
        {
            return await this.DataContext.Observations.Find(obs => obs.Id == observationId).FirstOrDefaultAsync();
        }
        public async Task<Observation> GetObservationbyId(string observationId)
        {
            return await this.DataContext.Observations.Find(obs => obs.Id == observationId).FirstOrDefaultAsync();
        }
        public async Task DeleteAllObservations()
        {
            await this.DataContext.Observations.DeleteManyAsync(x => x.Id != null);
        }
        public async Task<Observation> CreateObservationAsync(string speciesName, string genus, string userid, Entities.Enums.Confident confident, double latitude, double longitude, string[] pictures, int? treeSize)
        {
            Observation newObservation = new Observation();
            try
            {

                newObservation.Id = Guid.NewGuid().ToString("N");
                newObservation.Pictures = new List<string>();
                newObservation.Date = DateTime.UtcNow;

                var statement = new ObservationStatement();
                statement.Id = Guid.NewGuid().ToString("N");
                User user = await this.UsersManager.SelectAsync(userid);
                newObservation.UserId = user.OsmId;
                statement.UserId = user.OsmId;
                newObservation.AuthorName = user?.Name;
                newObservation.ObservationStatements = new List<ObservationStatement>();

                newObservation.Coordinates = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(longitude, latitude));
                newObservation.TreeSize = (TreeSize?)treeSize;


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

                if (pictures != null)
                {
                    foreach (string picture in pictures?.Where(p => !string.IsNullOrEmpty(p)))
                    {
                        newObservation.Pictures.Add(await this.FileManager.SaveDataUrlAsFileAsync("observations", picture));
                    }
                }

                await this.DataContext.Observations.InsertOneAsync(newObservation);

                await this.AddExplorationPointsForNewObservation(newObservation);


                var validator = await MissionValidatorFactory.GetValidator(this.ServiceProvider, user);
                if (validator != null)
                {
                    await validator?.UpdateMissionProgression(newObservation, statement, ActionType.CreateObservation);
                }
            }
            catch (Exception e)
            {
                throw;
            }


            return newObservation;
        }
        //POUR VALIDER UNE PROPOSITION EXISTANTE
        public async Task ConfirmStatement(string observationId, string statementId, string userId, bool isOnlyGenus)
        {

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
            User user = await this.UsersManager.SelectAsync(userId);
            var validator = await MissionValidatorFactory.GetValidator(this.ServiceProvider, user);
            if (validator != null)
            {
                await validator?.UpdateMissionProgression(existingObservation, statement, ActionType.ConfirmStatement);
            }
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
            User user = await this.UsersManager.SelectAsync(userId);
            var validator = await MissionValidatorFactory.GetValidator(this.ServiceProvider, user);
            if (validator != null)
            {
                await validator?.UpdateMissionProgression(existingObservation, statement, ActionType.CreateStatement);
            }

        }
        public async Task AddPictures(string observationId, string[] pictures)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }

            foreach (string pic in pictures?.Where(p => !string.IsNullOrEmpty(p)))
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
                if (!existingObservation.OSMStatus.HasValue)
                {
                    var user = await this.UsersManager.SelectAsync(existingObservation.UserId);
                    if (user != null)
                    {
                        BackgroundJob.Enqueue(() => this.SendMailForObservationToSendToOsm(user.Email, user.Name));
                    }
                }
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

            var observation = await this.GetUserObservationbyId(observationId);
            var statement = observation.ObservationStatements.FirstOrDefault(x => x.Id == statementId);
            var confirm = statement.ObservationStatementConfirmations?.FirstOrDefault(x => x.Id == confirmId);

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

                if (confirm != null)
                {
                    pointHistory.Add(new PointHistory { Point = 4, Type = (int)KnowledgePoint.ValidateSameGenus, Date = currentDate });

                    if (!confirm.IsOnlyGenus)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ValidateSameSpecies, Date = currentDate });
                    }
                    if (confirm.Confident.HasValue && confirm.Confident.Value == Entities.Enums.Confident.High)
                    {
                        pointHistory.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                    }
                    await this.UsersManager.AddKnowledegePoints(statement.UserId, pointHistory);
                    await this.UsersManager.AddTitles(statement.UserId);
                }
                else if (observation.ObservationStatements.Count == 2)
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
                    if (statement.Confident.HasValue && statement.Confident.Value == Entities.Enums.Confident.High)
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

                            if (statement.Confident.HasValue && statement.Confident.Value == Entities.Enums.Confident.High)
                            {
                                pointHistoryP0.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.ObservationConfident, Date = currentDate });
                            }

                            await this.UsersManager.AddKnowledegePoints(compareHistory.UserId, pointHistoryP0);
                            await this.UsersManager.AddTitles(compareHistory.UserId);
                        }


                        await this.UsersManager.AddKnowledegePoints(statement.UserId, pointHistoryPb);
                        await this.UsersManager.AddTitles(statement.UserId);
                    }
                }
            }
        }

        [Obsolete]
        public async Task<Observation> EditObservationAsync(ObservationStatement editObservation, string currentUserId)
        {
            var existingObservation = await this.GetUserObservationbyId(editObservation.Id);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
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
        }

        public async Task<int> CalculateUserSpeciesExpertise(string userId, string speciesName)
        {
            var data = await this.DataContext.Observations.Find(x => x.IsIdentified &&
            x.ObservationStatements.Any(s => s.SpeciesName == speciesName && (s.UserId == userId || s.ObservationStatementConfirmations.Any(c => c.UserId == userId)))).ToListAsync();
            //On filtre via le StatementValidatedId après, car cela n'est pas pris en charge par le drive MongoDb
            data = data.Where(o => o.ObservationStatements.Any(s => s.Id == o.StatementValidatedId)).ToList();

            var count = data.Count;
            var species = await this.SpeciesManager.GetSpeciesByNameAsync(speciesName);   
            var expertise = (count * species.Difficult * species.Rarity) + 1;

            return (int)Math.Min(expertise, 50);
        }
        public async Task<int> CalculateUserGenusExpertise(string userId, string genus)
        {
            var data = await this.DataContext.Observations.Find(x => x.IsIdentified &&
            x.ObservationStatements.Any(s => s.Genus == genus && (s.UserId == userId || s.ObservationStatementConfirmations.Any(c => c.UserId == userId)))).ToListAsync();
            //On filtre via le StatementValidatedId après, car cela n'est pas pris en charge par le drive MongoDb
            data = data.Where(o => o.ObservationStatements.Any(s => s.Id == o.StatementValidatedId)).ToList();

            var count = data.Count;

            var genusDifficult = await this.SpeciesManager.CalculDifficultGenus(genus);
            var genusRarity = await this.SpeciesManager.CalculRarityGenus(genus);
            var expertise = (count * genusDifficult * genusRarity) + 1;

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
        public async Task SetObservationToCertainAysnc(string observationId, string statementId, string userName)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);
            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            existingObservation.IsCertain = true;
            existingObservation.IsCertainBy = userName;
            existingObservation.StatementValidatedId = statementId;

            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
            if (!existingObservation.OSMStatus.HasValue)
            {
                var user = await this.UsersManager.SelectAsync(existingObservation.UserId);
                if (user != null)
                {
                    BackgroundJob.Enqueue(() => this.SendMailForObservationToSendToOsm(user.Email, user.Name));
                }
            }
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
            if (existingObservation.ObservationCommentarys == null)
            {
                existingObservation.ObservationCommentarys = new List<ObservationCommentary>();
            }
            existingObservation.ObservationCommentarys.Add(commentary);
            await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
        }

        public async Task<Observation> EditObservationStatementAsync(ObservationStatement editStatement, string observationId)
        {

            var existingObservation = await this.GetUserObservationbyId(observationId);
            var existingStatement = existingObservation.ObservationStatements.Find(s => s.Id == editStatement.Id);
            var os = existingObservation.ObservationStatements;

            if (existingStatement == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }
            if (existingObservation.ObservationStatements.Count() > 1)
            {
                if (editStatement.SpeciesName != null)
                {
                    if (os.Any(x => x.SpeciesName == editStatement.SpeciesName))
                    {
                        throw new BusinessException("Un relevé avec cette espèce existe déja vous pouvez le confirmer");
                    }
                }
                else if (editStatement.SpeciesName == null && editStatement.Genus != null)
                {
                    if (os.Any(x => x.Genus == editStatement.Genus))
                    {
                        throw new BusinessException("Un relevé avec ce genre existe déja, préciser l'espèce");

                    }
                }
            }

            try
            {
                existingStatement.CommonGenus = editStatement.CommonGenus;
                existingStatement.Genus = editStatement.Genus;
                existingStatement.SpeciesName = editStatement.SpeciesName;
                existingStatement.Confident = editStatement.Confident;
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

        public async Task<IEnumerable<Observation>> GetObservationToSendToOSM(string osmId)
        {
            return await this.DataContext.Observations.Find(o => o.UserId == osmId && !string.IsNullOrEmpty(o.StatementValidatedId) && o.OSMStatus == null).ToListAsync();
        }

        public async Task<Observation> EditObservationOSMStatus(string observationId, OSMStatus status)
        {
            var existingObservation = await this.GetUserObservationbyId(observationId);

            if (existingObservation == null)
            {
                throw new BusinessException("Ce relevé n'existe pas");
            }

            try
            {
                existingObservation.OSMStatus = status;
                await this.DataContext.Observations.FindOneAndReplaceAsync(o => o.Id == existingObservation.Id, existingObservation);
            }
            catch
            {
                throw;
            }

            return existingObservation;
        }

        public async Task SendMailForObservationToSendToOsm(string userEmail, string username)
        {
            if (string.IsNullOrEmpty(userEmail))
            {
                return;
            }
            var model = new NewObservationToSendToOsmModel();
            model.UserName = username;
            var email = new MimeMessage();
            email.Subject = $"Albiziapp :  Un relevé à été confirmé par la communauté";
            email.To.Add(MailboxAddress.Parse(userEmail));

            email.From.Add(new MailboxAddress(this.Configuration["Data:Emails:DefaultSenderName"], this.Configuration["Data:Emails:DefaultSenderEmail"]));

            var html = await this.RazorEngine.CompileRenderAsync("Emails.NewObservationToSendToOsm", model);

            email.AddBody(null, html);

            await email.SendWithSmtpAsync(false);

        }
    }
}
