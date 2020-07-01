using System.Text.Json.Serialization;

namespace DataMigrator
{
    public class OldFloraKeyProp
    {
        [JsonPropertyName("_id")]
        public string Id { get; set; }

        public string NormalizedForm { get; set; }

        public string FrTitle { get; set; }

        public string FrSubTitle { get; set; }
    }
}
