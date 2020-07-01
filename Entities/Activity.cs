using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities
{
    public class Activity
    {
        [BsonId]
        public string Id { get; set; }

        public ActivityType Type { get; set; }

        public string[] Options { get; set; }

        public string Instructions { get; set; }

        public int Order { get; set; }
    }
}
