using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class IdentificationMission : Mission
    {
        public Restriction Restriction { get; set; }

        public string[] ObservationIdentified { get; set; }
    }
}
