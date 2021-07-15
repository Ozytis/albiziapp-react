using Api;
using Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Web.Security
{
    public class RolesAuthorizationHandler : AuthorizationHandler<RolesAuthorizationRequirement>, IAuthorizationHandler
    {
        public UsersManager UsersManager { get; set; }

        public RolesAuthorizationHandler(UsersManager usersManager)
        {
            this.UsersManager = usersManager;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                       RolesAuthorizationRequirement requirement)
        {
            if (context.User == null || !context.User.Identity.IsAuthenticated)
            {
                context.Fail();
            }

            var validRole = false;
            if (requirement.AllowedRoles == null ||
                requirement.AllowedRoles.Any() == false)
            {
                validRole = true;
            }
            else
            {
                var claims = context.User.Claims;
                var osmId = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name).Value;
                var roles = requirement.AllowedRoles;
                var user = await this.UsersManager.SelectAsync(osmId);
                if (roles.Contains(UserRoleName.Administrator))
                {
                    validRole = this.UsersManager.UserIsInRole(user, Entities.Enums.UserRole.ADMINISTRATOR);
                }
                else if (roles.Contains(UserRoleName.Expert))
                {
                    validRole = this.UsersManager.UserIsInRole(user, Entities.Enums.UserRole.EXPERT);
                }
            }

            if (validRole)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
    }
}