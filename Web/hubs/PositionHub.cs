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
    public class PositionHub : Hub, IUserPosition
    {

        private HubConnectionManager ConnectionManager { get; }
        private HubPositionManager PositionManager { get; set; }

        protected IHubContext<PositionHub> _context;


        public PositionHub(HubConnectionManager connectionManager, IHubContext<PositionHub> context, HubPositionManager positionManager)
        {
            ConnectionManager = connectionManager;
            _context = context;
            this.PositionManager = positionManager;
        }
        public override Task OnDisconnectedAsync(Exception exception)
        {
            this.PositionManager.RemoveConnection(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
        public async Task<Task> SetPosition(double latitude, double longitude)
        {
            try
            {
                this.PositionManager.UpdatePosition(this.Context.ConnectionId, latitude, longitude);
                return Task.CompletedTask;
            }
            catch
            {
                throw new Exception("No connections found");
            }
        }

        public async Task SendRefresh(double latitude, double longitude)
        {
            List<string> connections = this.PositionManager.GetConnections(latitude,longitude);
            if (connections != null && connections.Count > 0)
            {
                foreach (var conn in connections)
                {
                    try
                    {
                        await _context.Clients.Client(conn).SendAsync("Refresh");
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
