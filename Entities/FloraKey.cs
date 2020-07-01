using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Entities
{
    public class FloraKey
    {
        [BsonId]
        public string Id { get; set; }

        public string NormalizedForm { get; set; }

        public string FrTitle { get; set; }

        public string FrSubTitle { get; set; }

        public List<FloraKeyValue> Values { get; set; }

        public int Order { get; set; }
    }
}
