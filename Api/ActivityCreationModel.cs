using System.ComponentModel.DataAnnotations;

namespace Api
{
    [GenerateClass]
    public class ActivityCreationModel
    {
        [Required(ErrorMessage = "Veuillez fournir les instructions de l'activité")]
        public string Instructions { get; set; }

        public string[] Options { get; set; }

        public int Order { get; set; }

        [Required(ErrorMessage = "Veuillez fournir le type de l'activité")]
        public int Type { get; set; }
    }
}
