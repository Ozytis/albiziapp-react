using Entities.Enums;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;
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

        public GeoJsonPoint<GeoJson2DGeographicCoordinates> Coordinates { get; set; }


        public string TelaBotanicaTaxon { get; set; }

        public string AuthorName { get; set; }

        public List<ObservationStatement> ObservationStatements { get; set; }

        public string StatementValidatedId { get; set; }

        public TreeSize? TreeSize { get; set; }

        public List<ObservationCommentary> ObservationCommentarys { get; set; }

        public bool IsCertain { get; set; }
        public string IsCertainBy { get; set; }

    }
}
