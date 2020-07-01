using Newtonsoft.Json;

namespace DataMigrator
{
    public class OldFloraKeyValue
    {
        [JsonProperty(PropertyName = "_id")]
        public string Id { get; set; }

        public string NormalizedForm { get; set; }
    }
}
