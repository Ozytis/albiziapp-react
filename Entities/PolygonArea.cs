using MongoDB.Driver.GeoJsonObjectModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    public class PolygonArea : RestrictedArea
    {
        public GeoJsonPolygon<GeoJson2DGeographicCoordinates> Polygon { get; set; }
    }
}
