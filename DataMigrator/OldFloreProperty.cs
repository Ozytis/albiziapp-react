using Newtonsoft.Json;

namespace DataMigrator
{
    public class OldFloreProperty
    {
        [JsonProperty(PropertyName = "$oid")]
        public string Property { get; set; }
    }
}
