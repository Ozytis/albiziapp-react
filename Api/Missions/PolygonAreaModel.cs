
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

namespace Api.Missions
{
    public class PolygonAreaModel : RestrictedAreaModel
    {
        public CoordinateModel[] Polygon { get; set; }
    }
}
