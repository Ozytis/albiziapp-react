using Api;
using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
