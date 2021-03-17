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
            return null; //return await this.DataContext.Missions.Find(_ => true).SortBy( m => m.Order).ToListAsync();
        }

        public async Task<Mission> GetMissionById(string missionId)
        {
            return null;// return await this.DataContext.Missions.Find(m => m.Id == missionId).FirstOrDefaultAsync();
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

    }
}
