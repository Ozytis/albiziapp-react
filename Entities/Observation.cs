using Entities.Enums;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Entities
{
    public class Observation
    {
        [BsonId]
        public string Id { get; set; }   

        public DateTime? UpdateDate { get; set; }

        public bool IsIdentified { get; set; }

        public List<string> Pictures { get; set; }

        public string UserId { get; set; }

        public DateTime Date { get; set; }


        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public string AuthorName { get; set; }

        public List<ObservationStatement> ObservationStatements { get; set; }

        public string StatementValidatedId { get; set; }

        public TreeSize? TreeSize { get; set; }

        public List<ObservationCommentary> ObservationCommentarys { get; set; }

    }
}
