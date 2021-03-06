﻿using System;

namespace Api
{
    public class ObservationModel
    {
        public string CommonGenus { get; set; }

        public string CommonSpeciesName { get; set; }

        public int? Confident { get; set; }

        public DateTime Date { get; set; }

        public string Genus { get; set; }

        public string[] Pictures { get; set; }

        public string Id { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public string SpeciesName { get; set; }

        public string UserId { get; set; }

        public string TelaBotanicaTaxon { get; set; }

        public string AuthorName { get; set; }

        public bool IsIdentified { get; set; }

        public ObservationStatementModel[] ObservationStatements { get; set; }

        public int? TreeSize { get; set; }

        public ObservationCommentaryModel[] ObservationCommentarys { get; set; }

        public string StatementValidatedId { get; set; }
        public bool IsCertain { get; set; }

        public string IsCertainBy { get; set; }
    }
}
