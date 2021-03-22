using System;
using System.Collections.Generic;
using System.Text;

namespace Api
{

    public class MissionProgressionModel
    {
        public string MissionId { get; set; }
        public DateTime StartDate { get; set; }

        public int? Progression { get; set; }
    }
}
