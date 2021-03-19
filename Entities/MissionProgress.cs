using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class MissionProgress
    {
        public string MissionId { get; set; }

        public DateTime StartDate { get; set; }

        public int? Progression { get; set; }

        public MissionProgressionHistory[] History { get; set; }

    }
}
