namespace Api
{
    [GenerateClass]
    public class ObservationCreationModel
    {
        public string Genus { get; set; }

        public int? IsConfident { get; set; }

        public string[] Pictures { get; set; }

        public string Species { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }
    }
}
