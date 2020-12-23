using System;

namespace Api
{
    public class ObservationStatementConfirmationModel
    {
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public string UserId { get; set; }
        public int Expertise { get; set; }
        public int? Confident { get; set; }
        public bool IsOnlyGenus { get; set; }
    }

}
