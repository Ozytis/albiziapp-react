using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public class TimeLimitModel : EndingConditionModel
    {
        public int Minutes { get; set; }
    }
}
