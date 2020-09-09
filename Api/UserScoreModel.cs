using System;
using System.Collections.Generic;
using System.Text;

namespace Api
{
    public class UserScoreModel
    {
        public string OsmId { get; set; }

        public int ExplorationPoints { get; set; }

        public PointHistoryModel[] ExplorationPointsHistory { get; set; }

        public int KnowledgePoints { get; set; }

        public PointHistoryModel[] KnowledgePointsHistory { get; set; }

        public string[] TrophiesId { get; set; }

        public string[] TitlesId { get; set; }
    }
}
