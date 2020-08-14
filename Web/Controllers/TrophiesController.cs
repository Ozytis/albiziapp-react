using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class TrophiesController : Controller
    {

        public TrophiesController(TrophiesManager trophiesManager)
        {
            this.TrophiesManager = trophiesManager;
        }

        public TrophiesManager TrophiesManager { get; }

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateTrophyAsync([FromBody] TrophyCreationModel model)
        {
            await this.TrophiesManager.CreateTrophyAsync(new Trophy
            {
                Title = model.Title,
                CountSuccessFullActivities = model.CountSuccessFullActivities
            });
        }
    }
}
