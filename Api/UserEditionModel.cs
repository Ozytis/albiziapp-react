using Api.Utils;
using System.ComponentModel.DataAnnotations;

namespace Api
{
    [GenerateClass]
    public class UserEditionModel
    {
        [Required(ErrorMessage ="Le nom est obligatoire")]
        public string Name { get; set; }

        [EmailAddressNullable(ErrorMessage ="L'adresse email est invalide")]
        public string Email { get; set; }

        public string OsmId { get; set; }

        public int? Role { get; set; }


    }
}
