using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string OsmId { get; set; }

        public string Name { get; set; }

        public int ExplorationPoints { get; set; }

        public int KnowledgePoints { get; set; }

        public string CurrentActivityId { get; set; }

        public string CurrentMissionId { get; set; }

        public string[] Trophies { get; set; }

        public string[] Titles { get; set; }
    }
}
