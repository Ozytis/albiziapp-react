using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
