using Api;
using Entities;

namespace Web.Mappings
{
    public static class UserMappings
    {
        public static UserModel ToUserApiModel(this User user)
        {
            return new UserModel
            {
                Id = user.Id,
                Name = user.Name,
                OsmId = user.OsmId
            };
        }
    }
}
