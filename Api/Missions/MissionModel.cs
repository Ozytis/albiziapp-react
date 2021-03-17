using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public abstract class MissionModel
    {
        public string Id { get; set; }

        public EndingConditionModel EndingCondition { get; set; }

        public RestrictedAreaModel RestrictedArea { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

    }
}
