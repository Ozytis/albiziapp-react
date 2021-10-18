using Business.Utils;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business
{
    public class HubPositionManager
    {
    

        // Stores the identifiers in a hashset to avoid storing duplicate connection ids
        private static readonly ConcurrentDictionary<string, Position> coordUser = new ConcurrentDictionary<string, Position>();

        public void UpdatePosition(string connectionId, double latitude, double longitude)
        {
            lock (coordUser)
            {
                coordUser[connectionId] = (new Position(latitude, longitude));
            }
        }

        public void RemoveConnection(string connectionId)
        {
            lock (coordUser)
            {
                if (coordUser.ContainsKey(connectionId))
                {
                    coordUser.Remove(connectionId, out var pos);
                }
            }
        }

        public List<string> GetConnections(double latitude, double longitude)
        {
           
            List<string> conn = new List<string>();
            var point = new Position(latitude,longitude);
            try
            {
                lock (coordUser)
                {
                    foreach(var p in coordUser)
                    {
                        var test = GeoHelper.CalculateDistance(point, p.Value);
                        if (GeoHelper.CalculateDistance(point,p.Value) < 15000)
                        {
                            conn.Add(p.Key);
                        }
                    }
                }
            }
            catch
            {
                conn = null;
            }
            return conn;
        }



    }
}
