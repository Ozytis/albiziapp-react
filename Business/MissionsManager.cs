using Entities;
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
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.746958,48.074989), new GeoJson2DGeographicCoordinates(-0.767936,48.083799),
               new GeoJson2DGeographicCoordinates(-0.777394,48.079838), new GeoJson2DGeographicCoordinates(-0.778360, 48.072354),
               new GeoJson2DGeographicCoordinates(-0.773097,48.063175),new GeoJson2DGeographicCoordinates(-0.761133,48.060604),
                new GeoJson2DGeographicCoordinates(-0.746958,48.074989))
            };

            mission2.Type = NewObservationMissionType.DifferentSpecies;
            await this.CreateMissionAsync(mission2);
        }
        public async Task MissionPolygon()
        {
            var mission2 = new NewObservationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "TEST POLYGON 5 COTE";
            mission2.Description = "TEST POLYGON 5 COTE";
            mission2.EndingCondition = new NumberOfActions
            {
                Number = 5,
            };
            mission2.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.746958, 48.074989), new GeoJson2DGeographicCoordinates(-0.767936, 48.083799),
               new GeoJson2DGeographicCoordinates(-0.777394, 48.079838), new GeoJson2DGeographicCoordinates(-0.778360, 48.072354),
               new GeoJson2DGeographicCoordinates(-0.773097, 48.063175), new GeoJson2DGeographicCoordinates(-0.761133, 48.060604),
                new GeoJson2DGeographicCoordinates(-0.746958, 48.074989))
            };

            mission2.Type = NewObservationMissionType.DifferentSpecies;
            await this.CreateMissionAsync(mission2);
        }
        /*public async Task GenerateVerifyMission()
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
        }*/
        public async Task GenerateIdentificationMission()
        {
            var mission = new IdentificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Mission identification : Identifier 3 relevés dans un polygone";
            mission.Description = "Mission identification : Identifier 3 relevés dans un polygone";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 3,
            };
            mission.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.574204, 48.019921), new GeoJson2DGeographicCoordinates(-0.573883, 48.01395),
               new GeoJson2DGeographicCoordinates(-0.588023, 48.015214), new GeoJson2DGeographicCoordinates(-0.587873, 48.021041),
                new GeoJson2DGeographicCoordinates(-0.574204, 48.019921))
                /* Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(48.074989, -0.746958), new GeoJson2DGeographicCoordinates(48.083799, -0.767936),
                new GeoJson2DGeographicCoordinates(48.079838, -0.777394), new GeoJson2DGeographicCoordinates(48.072354, -0.778360),
                new GeoJson2DGeographicCoordinates(48.063175, -0.773097), new GeoJson2DGeographicCoordinates(48.060604, -0.761133),
                 new GeoJson2DGeographicCoordinates(48.074989, -0.746958))*/
            };
            await this.CreateMissionAsync(mission);

            var mission2 = new IdentificationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "Mission identification : Identifier 2 relevés précis";
            mission2.Description = "Mission identification : Identifier 2 relevés précis";
            mission2.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission2.ObservationIdentified = new string[] { "2d4be513b0324d2289096c851932ad72", "51ac0a0e7aae4591977ed76841b03b4e" };
            await this.CreateMissionAsync(mission2);

            var mission3 = new IdentificationMission();
            mission3.Id = Guid.NewGuid().ToString("N");
            mission3.Title = "Mission identification : Identifier 2 relevés d'Abricotier commun dans un cercle";
            mission3.Description = "Mission identification : Identifier 2 relevés d'Abricotier commun dans un cercle";
            mission3.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission3.RestrictedArea = new CircleArea
            {
                Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(-0.7595157623291017, 48.0699066369019)),
                Radius = 1000,
            };
            mission3.Restriction = new Restriction
            {
                Type = RestrictionType.ExactSpecies,
                Value = "Abricotier commun",
                Genus = "Prunus",
                Species = "Prunus Armeniaca"
            };
            await this.CreateMissionAsync(mission3);
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
        
        public async Task GenerateVerifyMission()
        {
            var mission = new VerificationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Mission vérification : Verifier des relevés dans une zone circulaire";
            mission.Description = "Mission vérification : Verifier des relevés dans une zone circulaire";
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
            mission2.Title = "Mission vérification : Verifier des relevés d'abricotier commun en 10 minutes";
            mission2.Description = "Mission vérification : Verifier des relevés d'abricotier commun en 10 minutes";
            mission2.EndingCondition = new TimeLimit
            {
                Minutes = 10,
            };
            mission2.Restriction = new Restriction
            {
                Type = RestrictionType.ExactSpecies,
                Value = "Abricotier commun",
                Genus = "Prunus",
                Species = "Prunus Armeniaca"
            };
            await this.CreateMissionAsync(mission2);
        }
        public async Task GenerateNewObservationMission()
        {
            var mission = new NewObservationMission();
            mission.Id = Guid.NewGuid().ToString("N");
            mission.Title = "Mission de nouveau relevé : faites le plus de relevé possible en 5 minutes dans la zone indiqué";
            mission.Description = "Mission de nouveau relevé :  faites le plus de relevé possible en 5 minutes dans la zone indiqué";
            mission.EndingCondition = new TimeLimit
            {
                Minutes = 5,
            };
            mission.RestrictedArea = new PolygonArea
            {
                Polygon = GeoJson.Polygon(new GeoJson2DGeographicCoordinates(-0.746958, 48.074989), new GeoJson2DGeographicCoordinates(-0.767936, 48.083799),
               new GeoJson2DGeographicCoordinates(-0.777394, 48.079838), new GeoJson2DGeographicCoordinates(-0.778360, 48.072354),
               new GeoJson2DGeographicCoordinates(-0.773097, 48.063175), new GeoJson2DGeographicCoordinates(-0.761133, 48.060604),
                new GeoJson2DGeographicCoordinates(-0.746958, 48.074989))
            };
            await this.CreateMissionAsync(mission); 

          /*  var mission2 = new NewObservationMission();
            mission2.Id = Guid.NewGuid().ToString("N");
            mission2.Title = "Mission de nouveau relevé : faites 2 relevés d'Ailante dans la zone cicrulaire";
            mission2.Description = "Mission de nouveau relevé : faites 2 relevés d'Ailante dans la zone cicrulaire";
            mission.EndingCondition = new NumberOfActions
            {
                Number = 2,
            };
            mission2.EndingCondition = new e
            {
                Type = RestrictionType.ExactSpecies,
                Value = "Abricotier commun",
                Genus = "Prunus",
                Species = "Prunus Armeniaca"
            };
            await this.CreateMissionAsync(mission2);*/
        }

        
    }
}
