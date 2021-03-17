using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class VerificationMission : Mission
    {
        public bool UnreliableObservation { get; set; }

        public bool ObservationWithPics { get; set; }

        public Restriction Restriction { get; set; } 
    }
}
