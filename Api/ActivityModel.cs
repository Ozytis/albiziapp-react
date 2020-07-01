using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    public class ActivityModel
    {
        public string[] Options { get; set; }

        public string Instructions { get; set; }
        
        public string Id { get; set; }
        
        public int Type { get; set; }

        public int Order { get; set; }
    }
}
