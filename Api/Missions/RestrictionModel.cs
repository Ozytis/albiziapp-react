using System;
using System.Collections.Generic;
using System.Text;

namespace Api.Missions
{
    public class RestrictionModel
    {
        public RestrictionTypeModel Type { get; set; }

        public string Value { get; set; }
        public string Genus { get; set; }
        public string Species { get; set; }
    }
}
