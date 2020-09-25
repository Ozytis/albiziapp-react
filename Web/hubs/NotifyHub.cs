using Business;
using Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson.Serialization.Serializers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Web.Hubs
{
    public class NotifyHub : Hub,IUserNotify
    {

        private HubConnectionManager ConnectionManager { get; }
        protected IHubContext<NotifyHub> _context;


        public NotifyHub(HubConnectionManager connectionManager, IHubContext<NotifyHub> context)
        {
            ConnectionManager = connectionManager;
            _context = context;
        }

        public override Task OnConnectedAsync()
        {
            ConnectionManager.AddConnection(Context.User.Identity.Name, Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            ConnectionManager.RemoveConnection(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task<Task> SendNotif(string userName, string notifContent)
        {
            HashSet<string> connections = ConnectionManager.GetConnections(userName);

            try
            {
                if (connections != null && connections.Count > 0)
                {
                    foreach (var conn in connections)
                    {
                        
                        try
                        {
                            await _context.Clients.Client(conn).SendAsync("ReceivedNotif", notifContent);
                        }
                        catch
                        {
                            throw new Exception("No connections found");
                        }
                    }
                }
                return Task.CompletedTask;
            }
            catch
            {
                throw new Exception("ERROR");
            }
        }
    }
}
