using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public abstract class EndingConditionModel
    {
        public string EndingConditionType
        {
            get
            {
                return this.GetType().Name;
            }
        }
    }
}
