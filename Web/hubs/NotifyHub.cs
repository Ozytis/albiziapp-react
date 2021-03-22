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

        public async Task SendNotif(string userName, string notifContent)
        {
            await this.SendNotif("ReceivedNotif", userName, notifContent);           
        }

        public async Task SendErrorNotif(string userName, string notifContent)
        {
            await this.SendNotif("ErrorNotif", userName, notifContent);          
        }
        public async Task SendInfoNotif(string userName, string notifContent)
        {
            await this.SendNotif("InfoNotif", userName, notifContent);            
        }
        private async Task SendNotif(string level, string userName, string notifContent)
        {
            HashSet<string> connections = ConnectionManager.GetConnections(userName);
            if (connections != null && connections.Count > 0)
            {
                foreach (var conn in connections)
                {
                    try
                    {
                        await _context.Clients.Client(conn).SendAsync(level, notifContent);
                    }
                    catch
                    {
                        throw new Exception("No connections found");
                    }
                }
            }
        }
    }
}
