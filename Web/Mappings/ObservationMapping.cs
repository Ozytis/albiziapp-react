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
                //CommonGenus = observation.CommonGenus,
                //CommonSpeciesName = observation.CommonSpeciesName,
                //Confident = (int?)observation.Confident,
                Date = observation.Date,
                //Genus = observation.Genus,
                Pictures = observation.Pictures.ToArray(),
                Id = observation.Id,
                Latitude = observation.Latitude,
                Longitude = observation.Longitude,
                //SpeciesName = observation.SpeciesName,
                UserId = observation.UserId,
                IsIdentified = observation.IsIdentified,
                AuthorName = observation.AuthorName,
                ObservationStatements = observation.ObservationStatements.Select(s=>s.ToObservationStatementModel()).ToArray(),
            };
        }
        public static ObservationStatementModel ToObservationStatementModel(this ObservationStatement observationStatement)
        {
            return new ObservationStatementModel
            {
                Id= observationStatement.Id,
                UserId= observationStatement.UserId,
                Date= observationStatement.Date,
                CommonSpeciesName= observationStatement.CommonSpeciesName,
                SpeciesName= observationStatement.SpeciesName,
                CommonGenus= observationStatement.CommonGenus,
                Genus= observationStatement.Genus,
                TelaBotanicaTaxon= observationStatement.TelaBotanicaTaxon,
                Expertise= observationStatement.Expertise,
                Validate= observationStatement.Validate,
                Order= observationStatement.Order,
                Confident= (int?)observationStatement.Confident,
                TotalScore= observationStatement.TotalScore,

            };
        }
    }
}
