using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    public class FloraKeyModel
    {
        public string Id { get; set; }

        public string NormalizedForm { get; set; }

        public string FrTitle { get; set; }

        public string FrSubTitle { get; set; }

        public FloraKeyValueModel[] Values { get; set; }

        public int Order { get; set; }
    }
}
