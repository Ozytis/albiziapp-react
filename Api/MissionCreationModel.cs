using System.ComponentModel.DataAnnotations;

namespace Api
{
    public class MissionCreationModel
    {
        [MinLength(1, ErrorMessage = "Veuillez fournir au-moins une activité à la mission")]
        public ActivityCreationModel[] Activities { get; set; }

        public int Order { get; set; }
    }
}
