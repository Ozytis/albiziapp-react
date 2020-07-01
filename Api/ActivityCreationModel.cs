using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Api
{
    [GenerateClass]
    public class ActivityCreationModel
    {
        public string[] Options { get; set; }

        [Required(ErrorMessage = "Veuillez fournir les instructions de l'activité")]
        public string Instructions { get; set; }

        [Required(ErrorMessage = "Veuillez fournir le type de l'activité")]
        public int Type { get; set; }

        public int Order { get; set; }
    }
}
