using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    public class SpeciesInfoModel : SpeciesModel
    {
        public string[] Pictures { get; set; }

        public string Habitat { get; set; }

        public string Usage { get; set; }

        public string Description { get; set; }     
    }
}
