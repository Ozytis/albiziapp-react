using System;
using System.Threading.Tasks;

namespace Common
{
    public interface IUserNotify
    {
        public Task SendNotif(string username, string notifContent);

        public Task SendErrorNotif(string username, string notifContent);

        public Task SendInfoNotif(string username, string notifContent);

    }
}
