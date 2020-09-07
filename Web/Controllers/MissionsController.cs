using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;
using System.Collections.Generic;
using System.Linq;
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

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateMissionAsync([FromBody] MissionCreationModel model)
        {
            await this.MissionsManager.CreateMissionAsync(new Mission
            {
                Order = model.Order,
                Activities = model.Activities?.Select(a => new Activity
                {
                    Id = System.Guid.NewGuid().ToString(),
                    Instructions = new ActivityInstruction { Long = a.Instructions.Long, Short = a.Instructions.Short },
                    EndConditions =  a.EndConditions.Select(x =>  new ActivityEndCondition {  ActionCount = x.ActionCount,Time = x.Time}).ToArray(),                    
                    Options = a.Options,
                    Order = a.Order,
                    Type = (ActivityType)a.Type
                }).ToList()
            });
        }

        [HttpGet]
        public async Task<IEnumerable<MissionModel>> GetAllMissions()
        {
            IEnumerable<Mission> missions = await this.MissionsManager
                .GetAllMissionsAsync();

            return missions.OrderBy(m => m.Order).Select(mission => mission.ToMissionModel());
        }
    }
}