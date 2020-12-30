using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business.Extensions
{
    public static class ObservationStatementExtension
    {

        public static decimal CalculateReliabilityStatement(this ObservationStatement statement)
        {
            var score = statement.Expertise;
            if (statement.ObservationStatementConfirmations != null && statement.ObservationStatementConfirmations.Any())
            {
                score = score + statement.ObservationStatementConfirmations.Sum(x => x.Expertise);
            }
            return score;
        }

        public static decimal CalculateSpeciesReliabilityStatement(this ObservationStatement statement)
        {
            var score = !string.IsNullOrEmpty(statement.SpeciesName) ? statement.Expertise : 0;
            if (statement.ObservationStatementConfirmations != null && statement.ObservationStatementConfirmations.Any())
            {
                score = score + statement.ObservationStatementConfirmations.Where(x=>!x.IsOnlyGenus).Sum(x => x.Expertise);
            }
            return score;
        }

    }
}
