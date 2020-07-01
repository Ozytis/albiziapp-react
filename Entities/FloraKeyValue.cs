using MongoDB.Bson.Serialization.Attributes;

namespace Entities
{
    public class FloraKeyValue
    {
        [BsonId]
        public string Id { get; set; }

        public string NormalizedForm { get; set; }

        public string FloraKeyId { get; set; }
    }
}