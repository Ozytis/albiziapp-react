using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities
{
    public class Observation
    {
        [BsonId]
        public string Id { get; set; }

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

        public List<string> Pictures { get; set; }

        public bool IsIdentified { get; set; }

        public string AuthorName { get; set; }
    }
}
