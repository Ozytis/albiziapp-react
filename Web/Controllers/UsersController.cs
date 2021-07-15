using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration.UserSecrets;
using Ozytis.Common.Core.Utilities;
using Ozytis.Common.Core.Web.WebApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Web.Mappings;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        public UsersController(UsersManager usersManager)
        {
            this.UsersManager = usersManager;
        }

        public UsersManager UsersManager { get; }

        [HttpGet]
        public async Task<UserModel> GetAllUsers()
        {
            throw new NotImplementedException();
        }

        [HttpPost("login")]
        [ValidateModel, HandleBusinessException]
        public async Task<UserModel> LoginAsync([FromBody] UserLoginModel model)
        {
            User user = await this.UsersManager.LoginAsync(model.OsmId, model.UserName);

            if (user == null)
            {
                throw new BusinessException("Erreur de connexion");
            }

            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, model.OsmId),
                new Claim("FullName", model.UserName)
            };

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            AuthenticationProperties authProperties = new AuthenticationProperties
            {
                IssuedUtc = DateTime.UtcNow,
                RedirectUri = "/"
            };

            this.HttpContext.Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture("fr-FR")),
                new CookieOptions { Path = this.Url.Content("~/") });

            await this.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

            return user?.ToUserApiModel();
        }

        [HttpGet("missions")]
        [Authorize]
        public async Task<MissionUserModel> GetMissionsForUser()
        {
            var user = await this.UsersManager.SelectAsync(this.User.Identity.Name);

            return user?.ToMissionUserModel();
        }

        [HttpGet("score")]
        [Authorize]
        public async Task<UserScoreModel> GetScore()
        {
            var user = await this.UsersManager.SelectAsync(this.User.Identity.Name);

            return user?.ToUserScoreModel();
        }

        [HttpGet("userAdmin")]
        [Authorize]
        public async Task<bool> IsUserAdminAsync()
        {
            var user = await this.UsersManager.SelectAsync(this.User.Identity.Name);

            return this.UsersManager.IsUserAdmin(user);
        }

        [HttpGet("allUsers")]
        [Authorize(Roles = UserRoleName.Administrator)]
        public async Task<IEnumerable<UserModel>> GetAllUsersAsync()
        {
            IEnumerable<User> users = await this.UsersManager.GetAllUsers();
            return users.Select(u => u.ToUserApiModel());
        }

        [HttpGet("searchUsers")]
        [Authorize(Roles = UserRoleName.Administrator)]
        public async Task<IEnumerable<UserModel>> SearchUsersAsync(string search)
        {
            search = search?.ToLower().RemoveDiacritics().Trim();
            IEnumerable<User> users = await this.UsersManager.GetAllUsers();
            if (!string.IsNullOrEmpty(search))
            {
                users = users.Where(x => x.Name.ToLower().Trim().RemoveDiacritics().Contains(search));
            }
            return users.Select(u => u.ToUserApiModel());
        }

        [HttpGet("{userId}")]
        public async Task<UserModel> GetchesUsersAsync(string userId)
        {
            var user = await this.UsersManager.SelectAsync(userId);
            return user.ToUserApiModel();
        }

        [HttpPut]
        [HandleBusinessException, ValidateModel]
        [Authorize(Roles = UserRoleName.Administrator)]
        public async Task EditUserAysnc([FromBody] UserEditionModel model)
        {
            await this.UsersManager.EditUserAsync(
                new User
                {
                    OsmId = model.OsmId,
                    Name = model.Name,
                    Role = (Entities.Enums.UserRole?)model.Role
                });
        }
    }
}