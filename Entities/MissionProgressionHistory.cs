using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class MissionProgressionHistory
    {
        public string ObservationId { get; set; }

        public string StatementId { get; set; }

        public DateTime Date { get; set; }

        public ActionType Type { get; set; }

        public bool? SuccessRecognition { get; set; }

        public string Gender { get; set; }

        public string Species { get; set; }

    }

    public enum ActionType
    {
        CreateObservation = 1,
        CreateStatement = 2,
        ConfirmStatement = 3,
        Recognition = 4
    }
}
