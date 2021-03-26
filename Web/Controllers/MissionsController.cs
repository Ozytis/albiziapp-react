using Api;
using Api.Missions;
using Business;
using Business.MissionValidation;
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
        public MissionsController(MissionsManager missionsManager, UsersManager usersManager,IServiceProvider serviceProvider/*,NotifyHub notifyHub*/)
        {
            this.MissionsManager = missionsManager;
            this.UsersManager = usersManager;
            this.ServiceProvider = serviceProvider;
            //this.NotifyHub = notifyHub;
        }

        public MissionsManager MissionsManager { get; }
        public UsersManager UsersManager { get; }

        public IServiceProvider ServiceProvider { get; set; }


        [HttpGet("create")]
        [AllowAnonymous]
        public async Task CreateMission()
        {
            //await this.MissionsManager.GenerateMission();
            await this.MissionsManager.GenerateIdentificationMission();
            // User user = await this.UsersManager.SelectAsync(this.User.Identity.Name);
            //await this.MissionsManager.AddCompleteMission(user);
            //await this.MissionsManager.GenerateIdentificationCircleMission();
            //await this.MissionsManager.GenerateVerifyMission();
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
        [HttpGet("history")]
        public async Task<MissionHistoryModel[]> GetHistoryMission()
        {
            User user = await this.UsersManager.SelectAsync(this.User.Identity.Name);
            List<MissionHistoryModel> history = new List<MissionHistoryModel>(); ;

            if(user.MissionProgress?.History != null)
            {
                foreach (MissionProgressionHistory h in user.MissionProgress.History)
                {
                    history.Add(new MissionHistoryModel{
                        ObservationId = h.ObservationId,
                        Recognition = (bool)h.SuccessRecognition
                    });
                }
            }
                return history.ToArray(); 
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
        [HttpPost("newIdentification/{observationId}")]
        [AllowAnonymous]
        public async Task<bool> UpdateMissionProgression([FromBody] ObservationCreationModel identification, string observationId)
        {
            User user = await this.UsersManager.SelectAsync(this.User.Identity.Name);
            Mission mission = await this.MissionsManager.GetMissionById(user.MissionProgress.MissionId);
            ObservationStatement os = new ObservationStatement
            {
                Genus = identification.Genus,
                SpeciesName = identification.Species
            }; 
             var result = false;
             var validator= await MissionValidatorFactory.GetValidator(this.ServiceProvider, user);
            if(validator != null)
            {
               result = await ((IdentifyMissionValidator)validator).UpdateIdentifyMissionProgression(observationId, mission, os, user.OsmId);
            }
            return result;
        }
    }
}