using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Entities
{
    public class Observation : BaseObservation
    {
        [BsonId]
        public string Id { get; set; }   

        public DateTime? UpdateDate { get; set; }

        public bool IsIdentified { get; set; }

        public List<string> Pictures { get; set; }

        public List<ObservationValidation> Validations { get; set; }

        public List<BaseObservation> History { get; set; }
    }
}
