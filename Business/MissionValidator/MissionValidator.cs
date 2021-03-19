using Business.Utils;
using Entities;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public static class MissionValidatorFactory 
    {
        public static async Task<IMissionValidator> GetValidator(IServiceProvider serviceProvider, User user)
        {
            if (user == null || user.MissionProgress == null)
            {
                return null;
            }

            var observationManager = serviceProvider.GetService<ObservationsManager>();
            var missionsManager = serviceProvider.GetService<MissionsManager>();
            var userManager = serviceProvider.GetService<UsersManager>();
            var mission = (await missionsManager.GetAllMissionsAsync()).FirstOrDefault(m => m.Id == user.MissionProgress.MissionId);

            if (mission.GetType() == typeof(IdentificationMission))
            {
                return new IdentifyMissionValidator((IdentificationMission)mission, user, observationManager, missionsManager, userManager);
            }
            else if (mission.GetType() == typeof(NewObservationMission))
            {
                return new NewObservationMissionValidator((NewObservationMission)mission, user, observationManager, missionsManager, userManager);
            }
            else if (mission.GetType() == typeof(VerificationMission))
            {
                return new VerifyMissionValidator((VerificationMission)mission, user, observationManager, missionsManager, userManager);
            }
            else
            {
                return null;
            }
        }
    }
        
    public abstract class MissionValidator<T> where T : Mission
    {        
        public MissionsManager MissionsManager { get; }

        public ObservationsManager ObservationsManager { get; }

        public UsersManager UsersManager { get; }

        public T Mission { get; set; }

        public User User { get; set; }

        protected MissionValidator(T mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager)
        {
            this.User = user;
            this.Mission = mission;
            this.ObservationsManager = observationsManager;
            this.MissionsManager = missionsManager;
            this.UsersManager = usersManager;
        }

        public async Task ValidateActivity()
        {
            // await this.UsersManager.EndCurrentActivity(this.User.OsmId);
        }

        public async Task UpdateProgression(MissionProgressionHistory[] historyToUpdate)
        {
            var missionProgress = this.User.MissionProgress;
            missionProgress.Progression = historyToUpdate.Count();
            await this.UsersManager.UpdateMissionProgression(this.User.OsmId, missionProgress);
        }

        public bool ValidateRestrictedArea(Observation observation)
        {
            if (this.Mission.RestrictedArea != null)
            {
                if (this.Mission.RestrictedArea.GetType() == typeof(CircleArea))
                {
                    CircleArea cirleArea = (CircleArea)this.Mission.RestrictedArea;
                    double distance = GeoHelper.CalculateDistance(new Position(cirleArea.Center.Coordinates.Latitude, cirleArea.Center.Coordinates.Longitude), new Position(observation.Coordinates.Coordinates.Latitude, observation.Coordinates.Coordinates.Longitude));
                    return distance > cirleArea.Radius;
                }
                else
                {
                    PolygonArea polygonArea = (PolygonArea)this.Mission.RestrictedArea;
                    return GeoHelper.IsPointInPolygon(polygonArea.Polygon.Coordinates.Exterior.Positions.Select(x => new Position(x.Latitude, x.Longitude)).ToArray(), new Position(observation.Coordinates.Coordinates.Latitude, observation.Coordinates.Coordinates.Longitude));
                }
            }
            return true;
        }
        
    }
}
