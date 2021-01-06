using System;

namespace Api
{
    public class ObservationCommentaryModel
    {
        public string Id { get; set; }
        public string UserName { get; set; }

        public DateTime Date { get; set; }

        public string Commentary { get; set; }

    }

}
