using System;
using System.Collections.Generic;
using System.Text;

namespace Api
{
    public class MissionUserModel
    {
        public MissionProgressionModel MissionProgression { get; set; }

        public MissionsCompleteModel[] MissionsComplete { get; set; }
    }
}
