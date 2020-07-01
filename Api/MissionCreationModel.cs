using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    public class MissionCreationModel
    {
        [MinLength(1, ErrorMessage = "Veuillez fournir au-moins une activité à la mission")]
        public ActivityCreationModel[] Activities { get; set; }

        public int Order { get; set; }
    }
}
