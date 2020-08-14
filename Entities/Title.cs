using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
   public class Title
    {
        [BsonId]
        public string Id { get; set; }

        public string Name { get; set; }

        public  int ExplorationPoints { get; set; }

        public int KnowledgePoints { get; set; }
    }
}
