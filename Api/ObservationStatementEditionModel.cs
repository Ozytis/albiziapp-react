namespace Api
{
    [GenerateClass]
    public class ObservationStatementEditionModel
    {
        public string Id { get; set; }

        public string Genus { get; set; }

        public string Species { get; set; }

        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }

        public int? IsConfident { get; set; }
    }
}
