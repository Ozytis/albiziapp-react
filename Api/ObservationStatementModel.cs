using System;

namespace Api
{
    public class ObservationStatementModel
    {
        public string Id { get; set; }
        public string UserId { get; set; }

        public DateTime Date { get; set; }

        public string CommonSpeciesName { get; set; }

        public string SpeciesName { get; set; }

        public string CommonGenus { get; set; }

        public string Genus { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public int Expertise { get; set; }

        public bool Validate { get; set; }

        public int Order { get; set; }

        public int? Confident { get; set; }

        public int TotalScore { get; set; }
    }

}
