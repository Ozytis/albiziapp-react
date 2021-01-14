using System;
using System.Threading.Tasks;

namespace Common
{
    public interface IUserPosition
    {
        public Task SendRefresh(double latitude, double longitude);
    }
}
