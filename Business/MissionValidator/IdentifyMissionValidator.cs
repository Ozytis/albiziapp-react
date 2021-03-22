using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public class IdentifyMissionValidator : MissionValidator<IdentificationMission>, IMissionValidator
    {
        public IdentifyMissionValidator(IdentificationMission mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager) : base(mission, user, observationsManager, missionsManager, usersManager)
        {

        }

        public async Task<bool> UpdateMissionProgression(Observation observation, ObservationStatement statement, ActionType? type)
        {
            bool conditionsCompleted = true;
            
            int count = 0;
            /*foreach (var endCondition in this.Activity.EndConditions)
            {
                if (endCondition.ActionCount.HasValue)
                {
                    var observations = await this.ObservationsManager.GetUserIdentifyObservations(User.OsmId, User.MissionProgress.StartDate);
                     count = observations.Count();

                    if (count < endCondition.ActionCount.Value)
                    {
                        conditionsCompleted = false;
                    }

                }
                if (endCondition.Time.HasValue)
                {
                    var maxDate = DateTime.UtcNow.AddMinutes(-endCondition.Time.Value);
                    var date = new DateTime(Math.Max(User.MissionProgress.StartDate.Ticks, maxDate.Ticks));
                    var observations = await this.ObservationsManager.GetUserIdentifyObservations(User.OsmId, date);
                     count = observations.Count();

                    //todo check code existant mini requis
                    if (count < 5)
                    {
                        conditionsCompleted = false;
                    }
                }
            }

            if (conditionsCompleted)
            {
                await this.ValidateActivity();
            }
            else
            {
                await this.UpdateProgression(count);
                //todo updateMissionProgression
            }

            return conditionsCompleted;*/
            return false;
        }
    }
}
