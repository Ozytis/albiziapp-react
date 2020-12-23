using System;

namespace Api
{
    [GenerateClass]
    public class AddObservationStatementConfirmationModel
    {

        public string ObservationId { get; set; }
        public string StatementId { get; set; }
        public bool IsOnlyGenus { get; set; }
        public int? Confident { get; set; }


    }

}
