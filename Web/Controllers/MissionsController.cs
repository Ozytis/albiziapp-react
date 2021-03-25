using Api;
using Api.Missions;
using Business;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;
using System;
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
        public MissionsController(MissionsManager missionsManager, UsersManager usersManager/*,NotifyHub notifyHub*/)
        {
            this.MissionsManager = missionsManager;
            this.UsersManager = usersManager;
            //this.NotifyHub = notifyHub;
        }

        public MissionsManager MissionsManager { get; }
        public UsersManager UsersManager { get; }


        [HttpGet("create")]
        [AllowAnonymous]
        public async Task CreateMission()
        {
            //await this.MissionsManager.GenerateMission();
            //await this.MissionsManager.GenerateIdentificationMission();
            // User user = await this.UsersManager.SelectAsync(this.User.Identity.Name);
            //await this.MissionsManager.AddCompleteMission(user);
            await this.MissionsManager.GenerateIdentificationCircleMission();
            await this.MissionsManager.GenerateVerifyMission();
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
        [HttpPost("startMission")]
        [AllowAnonymous]
        public async Task StartMission([FromBody] MissionProgressionModel model)
        {
            MissionProgress mp = new MissionProgress();
            if(model.MissionId != null)
            {
                mp.MissionId = model.MissionId;
                mp.StartDate = DateTime.Now;
            }
            else
            {
                mp = null;
            }
            await this.UsersManager.StartMissionAsync(mp, this.User.Identity.Name);
        }
        [HttpPost("progression")]
        [AllowAnonymous]
        public async Task UpdateMissionProgression()
        {
            //await this.UsersManager.UpdateMissionProgression( this.User.Identity.Name);
        }
    }
}