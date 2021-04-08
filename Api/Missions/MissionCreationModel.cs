using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    [GenerateClass]

    public class MissionCreationModel
    {
        public EndingConditionModel EndingCondition { get; set; }

        public RestrictedAreaModel RestrictedArea { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string MissionType {get{
                return this.GetType().Name;       
            } 
        }
    }

}
