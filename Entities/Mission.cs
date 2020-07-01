using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
