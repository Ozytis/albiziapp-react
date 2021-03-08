using System.ComponentModel.DataAnnotations;

namespace Api
{
    [GenerateClass]
    public class ObservationCreationModel
    {
        public string Genus { get; set; }
        [Required(ErrorMessage = "Choisissez votre confiance")]

        public int? IsConfident { get; set; }

        public string[] Pictures { get; set; }

        public string Species { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public int? TreeSize { get; set; }

    }
}
