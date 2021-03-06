﻿namespace Api
{
    [GenerateClass]
    public class ObservationEditionModel
    {
        public string Id { get; set; }

        public string Genus { get; set; }

        public int? IsConfident { get; set; }

        public string[] Pictures { get; set; }

        public string Species { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }
    }
}
