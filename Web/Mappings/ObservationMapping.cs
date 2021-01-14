using Api;
using Entities;
using System.Linq;

namespace Web.Mappings
{
    public static class ObservationMapping
    {
        public static ObservationModel ToObservationModel(this Observation observation,User[] users)
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
                Latitude = observation.Coordinates.Coordinates.Latitude,
                Longitude = observation.Coordinates.Coordinates.Longitude,
                //SpeciesName = observation.SpeciesName,
                UserId = observation.UserId,
                IsIdentified = observation.IsIdentified,
                AuthorName = observation.AuthorName,
                ObservationStatements = observation.ObservationStatements.Select(s => s.ToObservationStatementModel(users)).ToArray(),
                TreeSize = (int?)observation.TreeSize,
                ObservationCommentarys = observation.ObservationCommentarys?.Select(s => s.ToObservationCommentaryModel()).ToArray(),
                StatementValidatedId = observation.StatementValidatedId

            };
        }
        public static ObservationStatementModel ToObservationStatementModel(this ObservationStatement observationStatement, User[] users)
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
                TotalScoreSpecies = observationStatement.TotalScoreSpecies,
                ObservationStatementConfirmations = observationStatement.ObservationStatementConfirmations?.Select(sc=>sc.ToObservationStatementConfirmationModel()).ToArray() ?? null,
                UserName = users?.FirstOrDefault(u => u.OsmId == observationStatement.UserId)?.Name
                

            };
        }
        public static ObservationStatementConfirmationModel ToObservationStatementConfirmationModel(this ObservationStatementConfirmation observationStatementConfirmation)
        {
            return new ObservationStatementConfirmationModel
            {
                Id = observationStatementConfirmation.Id,
                UserId = observationStatementConfirmation.UserId,
                Date = observationStatementConfirmation.Date,
                Expertise = observationStatementConfirmation.Expertise,
                Confident = (int?)observationStatementConfirmation.Confident,
                IsOnlyGenus = observationStatementConfirmation.IsOnlyGenus
            };
        }
        public static ObservationCommentaryModel ToObservationCommentaryModel(this ObservationCommentary observationCommentary)
        {
            return new ObservationCommentaryModel
            {
                Id = observationCommentary.Id,
                UserName = observationCommentary.UserName,
                Date = observationCommentary.Date,
                Commentary = observationCommentary.Commentary
            };
        }

    }
}
