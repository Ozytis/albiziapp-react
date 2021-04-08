using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public class NewObservationMissionModel : MissionModel
    {
        public NewObservationMissionTypeModel Type { get; set; }

        public string Value { get; set; }

    }
}
