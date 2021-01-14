namespace Api
{
    [GenerateClass]
    public class ObservationCreationModel
    {
        public string Genus { get; set; }

        public int? IsConfident { get; set; }

        public string[] Pictures { get; set; }

        public string Species { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}
