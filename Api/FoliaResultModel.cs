using System;
using System.Collections.Generic;
using System.Text;

namespace Api
{
    public class FoliaResultModel
    {
        public string SpeciesId { get; set; }

        public string Species { get; set; }

        public decimal Probability { get; set; }
    }
}