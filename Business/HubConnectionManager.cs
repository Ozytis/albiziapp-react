using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;

namespace Business
{
    public class HubConnectionManager : IHubConnectionManager
    {
        // Stores the identifiers in a hashset to avoid storing duplicate connection ids
        private static readonly ConcurrentDictionary<string, HashSet<string>> userMap = new ConcurrentDictionary<string, HashSet<string>>();

        public HubPositionManager HubPositionManager { get; set; }

        public HubConnectionManager(HubPositionManager hubPositionManager)
        {
            this.HubPositionManager = hubPositionManager;
        }

        // Gets the users who are connected to the hub
        public IEnumerable<string> OnlineUsers { get { return userMap.Keys; } }

        public void AddConnection(string username, string connectionId)
        {
            if (username == null)
            {
                return;
            }

            lock (userMap)
            {
                if (!userMap.ContainsKey(username))
                {
                    userMap[username] = new HashSet<string>
                    {
                        connectionId
                    };
                }
                else
                {
                    userMap[username].Add(connectionId);
                }
            }
        }

        public void RemoveConnection(string connectionId)
        {
            lock (userMap)
            {
                foreach (string username in userMap.Keys)
                {
                    if (userMap.ContainsKey(username) && userMap[username].Contains(connectionId))
                    {
                        userMap[username].Remove(connectionId);
                        break;
                    }
                }
            }
        }

        public HashSet<string> GetConnections(string username)
        {
            HashSet<string> conn = new HashSet<string>();
            try
            {
                lock (userMap)
                {
                    conn = userMap[username];
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
