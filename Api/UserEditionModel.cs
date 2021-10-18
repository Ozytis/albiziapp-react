using System.ComponentModel.DataAnnotations;

namespace Api
{
    [GenerateClass]
    public class UserEditionModel
    {
        [Required(ErrorMessage ="Le nom est obligatoire")]
        public string Name { get; set; }

        [EmailAddress(ErrorMessage ="Le format de l'adresse email est incorrect")]
        public string Email { get; set; }

        public string OsmId { get; set; }

        public int? Role { get; set; }

    }
}
