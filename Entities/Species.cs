using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Entities
{
    public class Species
    {
        [BsonId]
        public string Id { get; set; }

        public string CommonSpeciesName { get; set; }

        public string SpeciesName { get; set; }

        public string CommonGenus { get; set; }

        public string Genus { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public List<string> Pictures { get; set; }

        public string Habitat { get; set; }

        public string Usage { get; set; }

        public string Description { get; set; }

        public List<string> FloraKeyValues { get; set; }

        public int Difficult { get; set; }

        public decimal Rarity { get; set; }


    }
}