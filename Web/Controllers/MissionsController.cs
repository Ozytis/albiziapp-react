using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Web.Mappings;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class MissionsController : ControllerBase
    {
        public MissionsController(MissionsManager missionsManager)
        {
            this.MissionsManager = missionsManager;
        }

        public MissionsManager MissionsManager { get; }

        [HttpGet]
        public async Task<IEnumerable<MissionModel>> GetAllMissions()
        {
            IEnumerable<Mission> missions = await this.MissionsManager
                .GetAllMissionsAsync();

            return missions.OrderBy(m => m.Order).Select(mission => mission.ToMissionModel());
        }

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateMissionAsync([FromBody] MissionCreationModel model)
        {
            await this.MissionsManager.CreateMissionAsync(new Mission
            {
                Order = model.Order,
                Activities = model.Activities?.Select(a => new Activity
                {
                    Instructions = a.Instructions,
                    Options = a.Options,
                    Order = a.Order,
                    Type = (ActivityType)a.Type
                }).ToList()
            });
        }
    }
}
