using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public class VerificationMissionModel : MissionModel
    {
        public bool UnreliableObservation { get; set; }

        public bool ObservationWithPics { get; set; }

        public RestrictionModel Restriction { get; set; } 
    }
}
