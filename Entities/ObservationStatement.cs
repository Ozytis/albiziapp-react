using Entities.Enums;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class ObservationStatement
    {
        [BsonId]
        public string Id { get; set; }

        public string UserId { get; set; }

        public DateTime Date { get; set; }

        public string CommonSpeciesName { get; set; }

        public string SpeciesName { get; set; }

        public string CommonGenus { get; set; }

        public string Genus { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public decimal Expertise { get; set; }

        public bool Validate { get; set; } 

        public int Order { get; set; }

        public Confident? Confident { get; set; }

        public List<ObservationStatementConfirmation> ObservationStatementConfirmations { get; set; }

        public decimal TotalScore { get; set; }
        public decimal  TotalScoreSpecies { get; set; }
    }
}
