using Entities.Enums;
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

        public PointHistory[] ExplorationPointsHistory { get; set; }

        public int KnowledgePoints { get; set; }

        public PointHistory[] KnowledgePointsHistory { get; set; }

        public MissionProgress MissionProgress { get; set; }

        public MissionComplete[] MissionCompleted { get; set; }

        public string[] Trophies { get; set; }

        public string[] Titles { get; set; }

        public UserRole? Role { get; set; }

    }
}
