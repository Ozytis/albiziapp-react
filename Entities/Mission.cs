using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Entities
{
    public class Mission
    {
        [BsonId]
        public string Id { get; set; }

        public List<Activity> Activities { get; set; }

        public int Order { get; set; }
    }
}
