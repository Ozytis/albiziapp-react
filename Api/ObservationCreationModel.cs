using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    [GenerateClass]
    public class ObservationCreationModel
    {
        public string Genus { get; set; }

        public bool IsConfident { get; set; }

        public string Image { get; set; }

        public string Species { get; set; }
        
        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }
    }
}
