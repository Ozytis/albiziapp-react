using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class Trophy
    {
        [BsonId]
        public string Id { get; set; }

        public string Title { get; set; }

        public int CountSuccessFullActivities { get; set; }
    }
}
