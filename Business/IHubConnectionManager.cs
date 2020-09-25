using System;
using System.Collections.Generic;
using System.Text;

namespace Business
{
    public interface IHubConnectionManager
    {
        void AddConnection(string username, string connectionId);
        void RemoveConnection(string connectionId);
        HashSet<string> GetConnections(string username);
        IEnumerable<string> OnlineUsers { get; }
    }
}
