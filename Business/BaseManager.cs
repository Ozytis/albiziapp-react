using Entities;

namespace Business
{
    public class BaseManager
    {
        public BaseManager(DataContext dataContext)
        {
            this.DataContext = dataContext;
        }

        public DataContext DataContext { get; }
    }
}
