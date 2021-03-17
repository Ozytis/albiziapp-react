using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

namespace Api.Missions
{
    public class CircleAreaModel : RestrictedAreaModel
    {
        public CoordinateModel Center { get; set; }

        public double Radius { get; set; }
    }
}
