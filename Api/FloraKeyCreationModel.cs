namespace Api
{
    [GenerateClass]
    public class FloraKeyCreationModel
    {
        public string NormalizedForm { get; set; }

        public string FrTitle { get; set; }

        public string FrSubTitle { get; set; }

        public int Order { get; set; }

        public FloraKeyValueCreationModel[] Values { get; set; }
    }
}
