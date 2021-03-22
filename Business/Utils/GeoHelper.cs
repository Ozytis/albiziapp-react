using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business.Utils
{
    public class GeoHelper
    {

        public static double CalculateDistance(Position point1, Position point2)
        {
            var d1 = point1.Latitude * (Math.PI / 180.0);
            var num1 = point1.Longitude * (Math.PI / 180.0);
            var d2 = point2.Latitude * (Math.PI / 180.0);
            var num2 = point2.Longitude * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                     Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
            return 6376500.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3)));
        }
        public static bool IsPointInPolygon(Position[] polygon, Position testPoint)
        {
            bool result = false;
            int j = polygon.Count() - 1;
            for (int i = 0; i < polygon.Count(); i++)
            {
                if (polygon[i].Latitude < testPoint.Latitude && polygon[j].Latitude >= testPoint.Latitude || polygon[j].Latitude < testPoint.Latitude && polygon[i].Latitude >= testPoint.Latitude)
                {
                    if (polygon[i].Longitude + (testPoint.Latitude - polygon[i].Latitude) / (polygon[j].Latitude - polygon[i].Latitude) * (polygon[j].Longitude - polygon[i].Longitude) < testPoint.Longitude)
                    {
                        result = !result;
                    }
                }
                j = i;
            }
            return result;
        }
    }

    public class Position
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public Position(double latitude, double longitude)
        {
            this.Latitude = latitude;
            this.Longitude = longitude;
        }

    }
}
