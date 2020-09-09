using System;
using System.Collections.Generic;
using System.Text;

namespace Api
{
    public class TrophyModel
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Image { get; set; }

        public int CountSuccessFullActivities { get; set; }
    }
}
