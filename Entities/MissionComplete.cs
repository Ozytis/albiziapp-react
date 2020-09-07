using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class MissionComplete
    {
        public string IdMission { get; set; }

        public DateTime? CompletedDate { get; set; }

        public ActivityComplete[] ActivitiesCompleted { get; set; }
        
    }

    public class ActivityComplete
    {
        public string IdActivity { get; set; }

        public DateTime? CompletedDate { get; set; }
    }
}
