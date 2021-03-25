﻿using Entities;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business
{
    public class MissionsManager : BaseManager
    {
        public MissionsManager(DataContext dataContext) : base(dataContext)
        {
        }
        public async Task<IEnumerable<Mission>> GetAllMissionsAsync()
        {
            return await this.DataContext.Missions.Find(_ => true)/*.SortBy( m => m.Order)*/.ToListAsync();
        }

        public async Task<Mission> GetMissionById(string missionId)
        {
            return await this.DataContext.Missions.Find(m => m.Id == missionId).FirstOrDefaultAsync();
        }

        public async Task CreateMissionAsync(Mission mission)
        {
            using IClientSessionHandle session = await this.DataContext.MongoClient.StartSessionAsync();

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

        public async Task GenerateMission()
        {
            var mission = new NewObservationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Première identification";
            mission.Description = "Première identification description";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission.RestrictedArea = new CircleArea
            {
                Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(-0.5762835000000001, 48.015947000000004)),
                Radius = 3000
            };
            mission.Type = NewObservationMissionType.DifferentSpecies;
            await this.CreateMissionAsync(mission);


            var mission2 = new NewObservationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "Seconde identification";
            mission2.Description = "Seconde identification description";
            mission2.EndingCondition = new TimeLimit
            {
                Minutes = 5,
            };
            mission2.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.574204, 48.019921), new GeoJson2DGeographicCoordinates(-0.573883, 48.01395),
               new GeoJson2DGeographicCoordinates(-0.588023, 48.015214), new GeoJson2DGeographicCoordinates(-0.587873, 48.021041),
                new GeoJson2DGeographicCoordinates(-0.574204, 48.019921))
            };

            mission2.Type = NewObservationMissionType.DifferentSpecies;
            await this.CreateMissionAsync(mission2);
        }

        public async Task GenerateVerifyMission()
        {
            var mission = new VerificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Première verif identification";
            mission.Description = "Première verif identification description";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission.RestrictedArea = new CircleArea
            {
                Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(-0.5762835000000001, 48.015947000000004)),
                Radius = 3000
            };
            mission.UnreliableObservation = true;
            await this.CreateMissionAsync(mission);


            var mission2 = new VerificationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "Seconde verif identification";
            mission2.Description = "Seconde verif identification description";
            mission2.EndingCondition =  new NumberOfActions
            {
                Number = 1,
            };
            mission2.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.574204, 48.019921), new GeoJson2DGeographicCoordinates(-0.573883, 48.01395),
               new GeoJson2DGeographicCoordinates(-0.588023, 48.015214), new GeoJson2DGeographicCoordinates(-0.587873, 48.021041),
                new GeoJson2DGeographicCoordinates(-0.574204, 48.019921))
            };

            mission2.Restriction = new Restriction()
            {
                Type = RestrictionType.ExactGender,
                Value = "Prunus"
            };
            await this.CreateMissionAsync(mission2);
        }
        public async Task GenerateIdentificationMission()
        {
            var mission = new IdentificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Identifier des relevés spécifiques dans une zone";
            mission.Description = "Identifier des relevés spécifiques dans une zone";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
           // string[] tab = new string[] { "f05810b268a942eebd6c1909e7688ea6", "afb46627a0314cdc95d0edda8f510cc2" };
            //mission.ObservationIdentified = tab;
            mission.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.574204, 48.019921), new GeoJson2DGeographicCoordinates(-0.573883, 48.01395),
               new GeoJson2DGeographicCoordinates(-0.588023, 48.015214), new GeoJson2DGeographicCoordinates(-0.587873, 48.021041),
                new GeoJson2DGeographicCoordinates(-0.574204, 48.019921))
            };
            await this.CreateMissionAsync(mission);
        } 
        public async Task AddCompleteMission(User user)
        {
            if(user == null)
            {
                return;
            }
            var completeMission = new MissionComplete { IdMission = "0fbae5829539411e9bad8f90397c0738", StartDate = DateTime.Now, CompletedDate = DateTime.Now };
    user.MissionCompleted = new MissionComplete[]{completeMission};
            await this.DataContext.Users.FindOneAndReplaceAsync(u => u.Id == user.Id, user);
        }
        
        public async Task GenerateIdentificationCircleMission()
        {
            var mission = new IdentificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Identifier des relevés spécifiques dans une zone circulaire";
            mission.Description = "Identifier des relevés spécifiques dans une zone circulaire";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission.RestrictedArea = new CircleArea
            {
                Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(-0.7595157623291017, 48.0699066369019)),
                Radius = 1000,
            };
            mission.Restriction = new Restriction
            {
                Type = RestrictionType.ExactSpecies,
                Value = "Abricotier commun",
                Genus = "Prunus",
                Species = "Prunus Armeniaca"
            };
            await this.CreateMissionAsync(mission);
        }
        public async Task GenerateVerifyMission()
        {
            var mission = new VerificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Verifier des relevés spécifiques dans une zone circulaire avec photo";
            mission.Description = "Verifier des relevés spécifiques dans une zone circulaire avec photo";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission.RestrictedArea = new CircleArea
            {
                Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(-0.7595157623291017, 48.0699066369019)),
                Radius = 1000,
            };
            await this.CreateMissionAsync(mission); 
            var mission2 = new VerificationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "Verifier des relevés spécifiques dans une zone polygonale avec chrono";
            mission2.Description = "Verifier des relevés spécifiques dans une zone polygonale avec chrono";
            mission2.EndingCondition = new TimeLimit
            {
                Minutes = 10,
            };
            mission2.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.574204, 48.019921), new GeoJson2DGeographicCoordinates(-0.573883, 48.01395),
                new GeoJson2DGeographicCoordinates(-0.588023, 48.015214), new GeoJson2DGeographicCoordinates(-0.587873, 48.021041),
                 new GeoJson2DGeographicCoordinates(-0.574204, 48.019921))
            };
            mission2.Restriction = new Restriction
            {
                Type = RestrictionType.ExactSpecies,
                Value = "Abricotier commun",
                Genus = "Prunus",
                Species = "Prunus Armeniaca"
            };
            await this.CreateMissionAsync(mission2);
            var mission3 = new VerificationMission();
            mission3.Id = Guid.NewGuid().ToString("N");
            mission3.Title = "Verifier des relevés spécifiques dans une zone circulaire";
            mission3.Description = "Verifier des relevés spécifiques dans une zone circulaire";
            mission3.EndingCondition = new TimeLimit
            {
                Minutes = 10,
            };            
            await this.CreateMissionAsync(mission3);
        }
    }
}
