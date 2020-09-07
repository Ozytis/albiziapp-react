using Entities;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public abstract class MissionValidator
    {
        public static async Task<IMissionValidator> GetValidatorFromActivity(IServiceProvider serviceProvider,User user)
        {
            if (user == null || user.MissionProgress == null)
            {
                return null;
            }
            
            var observationManager = serviceProvider.GetService<ObservationsManager>();
            var missionsManager = serviceProvider.GetService<MissionsManager>();
            var userManager = serviceProvider.GetService<UsersManager>();
            var activity = (await missionsManager.GetAllMissionsAsync()).FirstOrDefault(m => m.Id == user.MissionProgress.MissionId).Activities.FirstOrDefault(a => a.Id == user.MissionProgress.ActivityId);
            switch (activity.Type)
            {
                case ActivityType.Identify:
                    return new IdentifyMissionValidator(activity, user, observationManager, missionsManager, userManager);
                case ActivityType.Inventory:
                    return new InventoryMissionValidator(activity, user, observationManager, missionsManager, userManager);
                case ActivityType.Verify:
                    return new VerifyMissionValidator(activity, user, observationManager, missionsManager, userManager);
                default:
                    throw new BusinessException("Cannot find type of activity");
            }
        }

        public MissionsManager MissionsManager { get; }

        public ObservationsManager ObservationsManager { get; }

        public UsersManager UsersManager { get; }

        public Activity Activity { get; set; }

        public User User { get; set; }

        protected MissionValidator(Activity activity,User user, ObservationsManager observationsManager,MissionsManager missionsManager,UsersManager usersManager)
        {
            this.Activity = activity;
            this.User = user;
            this.ObservationsManager = observationsManager;
            this.MissionsManager = missionsManager;
            this.UsersManager = usersManager;
        }

        public async Task ValidateActivity()
        {
            await this.UsersManager.EndCurrentActivity(this.User.OsmId);
        }


        public async Task UpdateProgression(int progression)
        {
            var missionProgress = this.User.MissionProgress;
            missionProgress.Progression = progression;
            await this.UsersManager.UpdateMissionProgression(this.User.OsmId, missionProgress);
        }
    }
}
