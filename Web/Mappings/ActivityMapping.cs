using Api;
using Entities;

namespace Web.Mappings
{
    public static class ActivityMapping
    {
        public static ActivityModel ToActivityModel(this Activity activity)
        {
            return new ActivityModel
            {
                Id = activity.Id,
                Instructions = activity.Instructions,
                Options = activity.Options,
                Type = (int)activity.Type,
                Order = activity.Order
            };
        }
    }
}
