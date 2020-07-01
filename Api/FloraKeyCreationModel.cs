using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    [GenerateClass]
    public class FloraKeyCreationModel
    {        
        public string NormalizedForm { get; set; }

        public string FrTitle { get; set; }

        public string FrSubTitle { get; set; }

        public int Order { get; set; }

        public FloraKeyValueCreationModel[] Values { get; set; }
    }
}
