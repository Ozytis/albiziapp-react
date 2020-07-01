using Api;
using Entities;
using System.Linq;

namespace Web.Mappings
{
    public static class SpeciesMapping
    {
        public static SpeciesModel ToSpeciesModel(this Species species)
        {
            return new SpeciesModel
            {
                CommonGenus = species.CommonGenus,
                CommonSpeciesName = species.CommonSpeciesName,
                Genus = species.Genus,
                Id = species.Id,
                SpeciesName = species.SpeciesName,
                TelaBotanicaTaxon = species.TelaBotanicaTaxon,
                FloraKeyValues = species.FloraKeyValues.ToArray(),
            };
        }

        public static SpeciesInfoModel ToSpeciesInfoModel(this Species species)
        {
            return new SpeciesInfoModel
            {
                CommonGenus = species.CommonGenus,
                CommonSpeciesName = species.CommonSpeciesName,
                Genus = species.Genus,
                Id = species.Id,
                SpeciesName = species.SpeciesName,
                TelaBotanicaTaxon = species.TelaBotanicaTaxon,
                Description = species.Description,
                Habitat = species.Habitat,
                Pictures = species.Pictures?.ToArray(),
                Usage = species.Usage,
            };
        }

        public static FloraKeyModel ToFloraKeyModel(this FloraKey floraKey)
        {
            return new FloraKeyModel
            {
                FrSubTitle = floraKey.FrSubTitle,
                FrTitle = floraKey.FrTitle,
                Id = floraKey.Id,
                NormalizedForm = floraKey.NormalizedForm,
                Order = floraKey.Order,
                Values = floraKey.Values?.Select(value => value.ToFloraKeyValueModel()).ToArray()
            };
        }

        public static FloraKeyValueModel ToFloraKeyValueModel(this FloraKeyValue value)
        {
            return new FloraKeyValueModel
            {
                FloraKeyId = value.FloraKeyId,
                Id = value.Id,
                NormalizedForm = value.NormalizedForm
            };
        }
    }
}
