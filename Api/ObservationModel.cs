using System;

namespace Api
{
    public class ObservationModel
    {
        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }

        public bool Confident { get; set; }

        public DateTime Date { get; set; }

        public string Genus { get; set; }

        public string[] Pictures { get; set; }

        public string Id { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public string SpeciesName { get; set; }

        public string UserId { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public string AuthorName { get; set; }

        public bool IsIdentified { get; set; }

        public string [] Validations { get; set; }

        public string[] HistoryEditor { get; set; }
    }
}
