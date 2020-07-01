using Api;
using Entities;
using System.Linq;

namespace Web.Mappings
{
    public static class MissionMappings
    {
        public static MissionModel ToMissionModel(this Mission mission)
        {
            return new MissionModel
            {
                Id = mission.Id,
                Activities = mission.Activities?.OrderBy(a => a.Order).Select(activity => activity.ToActivityModel()).ToArray(),
                Order = mission.Order
            };
        }
    }
}
