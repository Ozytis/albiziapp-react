namespace Api
{
    [GenerateClass]
    public class SpeciesCreationModel
    {
        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }

        public string Genus { get; set; }

        public string SpeciesName { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public string[] Pictures { get; set; }

        public string Habitat { get; set; }

        public string Usage { get; set; }

        public string Description { get; set; }

        public string[] FloraKeyValues { get; set; }
    }
}
