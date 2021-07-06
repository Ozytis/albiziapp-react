using System;
using System.Collections.Generic;

namespace Folia
{
    public class FoliaResult
    {
        public Dictionary<int, string> Species { get; set; }

        public Dictionary<int, decimal> Probability { get; set; }
    }
}