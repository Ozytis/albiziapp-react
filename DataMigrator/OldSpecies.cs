namespace DataMigrator
{
    public class OldSpecies
    {
        public string[] Images { get; set; }

        public int TelaBotanicaTaxon { get; set; }

        public string Species { get; set; }

        public string Genus { get; set; }

        public string Common_genus { get; set; }

        public string Common { get; set; }

        public string Habitat { get; set; }

        public string Usage { get; set; }

        public string Description { get; set; }

        public OldFloreProperty[] FloreProperties { get; set; }
    }
}
