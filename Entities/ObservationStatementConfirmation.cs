using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class ObservationStatementConfirmation
    {
        [BsonId]
        public string Id { get; set; }

        public DateTime Date { get; set; }

        public string UserId { get; set; }

        public int Expertise { get; set; }

    }
}
