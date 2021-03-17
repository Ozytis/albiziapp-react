using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web.Hubs;
using Web.Mappings;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class MissionsController : ControllerBase
    {
        public MissionsController(MissionsManager missionsManager/*,NotifyHub notifyHub*/)
        {
            this.MissionsManager = missionsManager;
            //this.NotifyHub = notifyHub;
        }

        public MissionsManager MissionsManager { get; }


        [HttpGet("create")]
        [AllowAnonymous]
        public async Task CreateMission()
        {
            await this.MissionsManager.GenerateMission();
        }

        //public NotifyHub NotifyHub { get; }

        /* [HttpPost]
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
        */

        [HttpGet]
        public async Task<IEnumerable<MissionModel>> GetAllMissions()
        {
            IEnumerable<Mission> missions = await this.MissionsManager
                .GetAllMissionsAsync();

            return missions.Select(mission => mission.ToMissionModel());
        }

    }
}