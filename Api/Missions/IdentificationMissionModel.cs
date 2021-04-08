using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public class IdentificationMissionModel : MissionModel
    {
        public RestrictionModel Restriction { get; set; }

        public string[] ObservationIdentified { get; set; }
    }
}
