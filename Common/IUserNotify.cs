using System;
using System.Threading.Tasks;

namespace Common
{
    public interface IUserNotify
    {
        public Task<Task> SendNotif(string username, string notifContent);

        public Task<Task> SendErrorNotif(string username, string notifContent);

        public Task<Task> SendInfoNotif(string username, string notifContent);

    }
}
