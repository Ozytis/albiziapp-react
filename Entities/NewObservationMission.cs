using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class NewObservationMission : Mission
    {
        public NewObservationMissionType Type { get; set; }

        public string Value { get; set; }

    }
}
