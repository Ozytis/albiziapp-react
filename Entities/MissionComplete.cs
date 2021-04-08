using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class MissionComplete
    {
        public string IdMission { get; set; }

        public DateTime StartDate { get; set; }

        public MissionProgressionHistory[] History { get; set; }

        public DateTime? CompletedDate { get; set; }

    }

 
}
