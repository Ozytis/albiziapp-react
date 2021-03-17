using MongoDB.Driver.GeoJsonObjectModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class CircleArea : RestrictedArea
    {
        public GeoJsonPoint<GeoJson2DGeographicCoordinates> Center { get; set; }

        public double Radius { get; set; }
    }
}
