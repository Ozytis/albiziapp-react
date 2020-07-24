﻿namespace Api
{
    [GenerateClass]
    public class ObservationEditionModel
    {
        public string Id { get; set; }

        public string Genus { get; set; }

        public bool IsConfident { get; set; }

        public string Image { get; set; }

        public string Species { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }
    }
}
