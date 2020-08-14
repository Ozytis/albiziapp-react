using Api;
using Entities;
using System.Linq;

namespace Web.Mappings
{
    public static class ObservationMapping
    {
        public static ObservationModel ToObservationModel(this Observation observation)
        {
            return new ObservationModel
            {
                CommonGenus = observation.CommonGenus,
                CommonSpeciesName = observation.CommonSpeciesName,
                Confident = observation.Confident,
                Date = observation.Date,
                Genus = observation.Genus,
                HasPicture = observation.Pictures?.Any() ?? false,
                Id = observation.Id,
                Latitude = observation.Latitude,
                Longitude = observation.Longitude,
                SpeciesName = observation.SpeciesName,
                UserId = observation.UserId,
                IsIdentified = observation.IsIdentified,
                AuthorName = observation.AuthorName,
                Validations = observation.Validations?.Select(x => x.OsmId).ToArray()
            };
        }
    }
}
