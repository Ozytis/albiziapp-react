using MongoDB.Bson.Serialization.Attributes;

namespace Entities
{
    public class Activity
    {
        [BsonId]
        public string Id { get; set; }

        public ActivityType Type { get; set; }

        public string[] Options { get; set; }

        public ActivityInstruction Instructions { get; set; }

        public ActivityEndCondition[] EndConditions { get; set; }

        public int Order { get; set; }
    }
}
