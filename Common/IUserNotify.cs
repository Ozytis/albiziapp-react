using System;
using System.Threading.Tasks;

namespace Common
{
    public interface IUserNotify
    {
        public Task<Task> SendNotif(string username, string notifContent);


    }
}
