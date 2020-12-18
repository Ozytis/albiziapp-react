using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business.Extensions
{
    public static class ObservationStatementExtension
    {

        public static int CalculateReliabilityStatement(this ObservationStatement statement)
        {
            var score = statement.Expertise;
            if (statement.ObservationStatementConfirmations != null && statement.ObservationStatementConfirmations.Any())
            {
                score = score + statement.ObservationStatementConfirmations.Sum(x => x.Expertise);
            }
            return score;
        }

    }
}
