using Entities.Enums;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class ObservationCommentary
    {
        [BsonId]
        public string Id { get; set; }

        public string UserName { get; set; }

        public DateTime Date { get; set; }

        public  string Commentary { get; set; }
    }
}
