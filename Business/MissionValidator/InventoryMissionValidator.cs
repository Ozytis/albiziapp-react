using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public class InventoryMissionValidator : MissionValidator, IMissionValidator
    {
        public InventoryMissionValidator(Activity activity, User user, ObservationsManager observationsManager, MissionsManager missionsManager,UsersManager usersManager) : base(activity, user, observationsManager, missionsManager,usersManager)
        {

        }

        public async Task<bool> UpdateActivityProgression()
        {
            bool conditionsCompleted = true;
            var opts = Activity.Options;
            var isDifferentGenis = opts?.Contains("DIFFERENTGENUS") ?? false;
            var count = 0;
            foreach (var endCondition in this.Activity.EndConditions)
            {
                if (endCondition.ActionCount.HasValue)
                {
                    var ibs1 = await this.ObservationsManager.GetUserObservations(User.OsmId);
                    var observations = (await this.ObservationsManager.GetUserObservations(User.OsmId)).Where(o => o.Date >= User.MissionProgress.StartDate);
                    count = observations.Count();
                    if (isDifferentGenis)
                    {
                        count = observations.Select(x => x.Genus).Distinct().Count();
                    }

                    if (count < endCondition.ActionCount.Value)
                    {
                        conditionsCompleted = false;
                    }

                }
                if (endCondition.Time.HasValue)
                {
                    var maxDate = DateTime.UtcNow.AddMinutes(-endCondition.Time.Value);

                    var observations = (await this.ObservationsManager.GetUserObservations(User.OsmId)).Where(o => o.Date >= new DateTime(Math.Max(User.MissionProgress.StartDate.Ticks, maxDate.Ticks)));
                    count = observations.Count();
                    if (isDifferentGenis)
                    {
                        count = observations.Select(x => x.Genus).Distinct().Count();
                    }

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

            return conditionsCompleted;
        }

    }
}
