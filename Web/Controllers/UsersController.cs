using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Utilities;
using Ozytis.Common.Core.Web.WebApi;
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

            // Pas de gestion des rôles pour le moment
            // foreach (string role in await this.UsersManager.GetRoleNamesAsync(user))
            // {
            //    claims.Add(new Claim(ClaimTypes.Role, role));
            // }           

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            AuthenticationProperties authProperties = new AuthenticationProperties
            {
                IssuedUtc = DateTime.UtcNow,
                RedirectUri = "/"
            };

            this.HttpContext.Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture("fr-FR")),
                new CookieOptions { Path = this.Url.Content("~/") }
            );

            await this.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);


            return user?.ToUserApiModel();
        }
    }
}
