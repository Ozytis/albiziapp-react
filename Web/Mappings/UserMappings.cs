using Api;
using Entities;
using System.Collections.Generic;
using System.Linq;

namespace Web.Mappings
{
    public static class UserMappings
    {
        public static UserModel ToUserApiModel(this User user)
        {
            return new UserModel
            {
                Id = user.Id,
                Name = user.Name,
                OsmId = user.OsmId
            };
        }

        public static MissionUserModel ToMissionUserModel(this User user)
        {
            var model = new MissionUserModel();
            if (user.MissionProgress != null)
            {
                model.MissionProgression = new MissionProgressionModel
                {
                    ActivityId = user.MissionProgress.ActivityId,
                    MissionId = user.MissionProgress.MissionId,
                    Progression = user.MissionProgress.Progression,
                    StartDate = user.MissionProgress.StartDate
                };
            }

            if (user.MissionCompleted != null)
            {
                var missionsComplete = new List<MissionComplete>();
                model.MissionsComplete = user.MissionCompleted.Select(mc => new MissionsCompleteModel
                {
                    IdMission = mc.IdMission,
                    CompletedDate = mc.CompletedDate,
                    ActivitiesCompleted = mc.ActivitiesCompleted?.Select(ac => new ActivityCompleteModel { CompletedDate = ac.CompletedDate, IdActivity = ac.IdActivity }).ToArray()
                }).ToArray();
            }

            return model;
        }
    }
}
