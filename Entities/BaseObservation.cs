using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class BaseObservation
    {
        public string UserId { get; set; }

        public DateTime Date { get; set; }

        public string CommonSpeciesName { get; set; }

        public string SpeciesName { get; set; }

        public string CommonGenus { get; set; }

        public string Genus { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public bool Confident { get; set; }

        public string TelaBotanicaTaxon { get; set; }
     

        public string AuthorName { get; set; }
    }
}
