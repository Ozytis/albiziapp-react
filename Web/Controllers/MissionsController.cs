﻿using Api;
using Api.Missions;
using Business;
using Business.MissionValidation;
using Common;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web.Hubs;
using Web.Mappings;
using Web.Utilities;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class MissionsController : ControllerBase
    {
        public MissionsController(MissionsManager missionsManager, UsersManager usersManager,IServiceProvider serviceProvider/*,NotifyHub notifyHub*/, IUserNotify userNotify)
        {
            this.MissionsManager = missionsManager;
            this.UsersManager = usersManager;
            this.ServiceProvider = serviceProvider;
            //this.NotifyHub = notifyHub;
            this.UserNotify = userNotify;
        }

        public MissionsManager MissionsManager { get; }
        public UsersManager UsersManager { get; }
        public IUserNotify UserNotify { get; }

        public IServiceProvider ServiceProvider { get; set; }


        [HttpGet("create")]
        [AllowAnonymous]
        public async Task CreateMission()
        {
            //await this.MissionsManager.GenerateMission();
            //await this.MissionsManager.GenerateIdentificationMission();
            //User user = await this.UsersManager.SelectAsync(this.User.Identity.Name);
            //await this.MissionsManager.AddCompleteMission(user);
            await this.MissionsManager.GenerateNewObservationMission();
            //await this.MissionsManager.GenerateVerifyMission();
           // await this.MissionsManager.MissionPolygon();
        }
        [HttpPost]
        [AllowAnonymous]
        public async Task CreateMissionAsync([FromBody] MissionCreationModel model)
        {
            Console.WriteLine(model);
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


        [HttpGet("dev")]
        [AllowAnonymous]
        [JsonTypeNameHandlingOutputAttribute]
        public async Task<MissionModel[]> GetAllMissionsDev()
        {
            IEnumerable<Mission> missions = await this.MissionsManager
                .GetAllMissionsAsync();

            return missions.Select(mission => mission.ToMissionModel()).ToArray();
        }

        [HttpPost("createMissionFromApi")]
        [AllowAnonymous]
        public async Task CreateMissionFromApi([FromBody] MissionModel model)
        {
            try
            {
                var mission = model.ToMission();
                await this.MissionsManager.CreateMissionAsync(mission);
                await this.UserNotify.SendNotif(this.User.Identity.Name, "La mission a bien été crée");
            }
            catch (BusinessException ex)
            {
                await this.UserNotify.SendErrorNotif(this.User.Identity.Name, ex.Message);

            }
            //return missions.Select(mission => mission.ToMissionModel()).ToArray();
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
                    MissionHistoryModel mhm = new MissionHistoryModel();
                    mhm.ObservationId = h.ObservationId;
                    mhm.Recognition = h.SuccessRecognition != null ? (bool)h.SuccessRecognition : false ;
                    history.Add(mhm);
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
                mp.StartDate = DateTime.UtcNow;
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
        [HttpPost("endTimer/{missionId}")]
        [AllowAnonymous]
        public async Task TimerIsEnd(string missionId)
        {
            User user =await this.UsersManager.SelectAsync(this.User.Identity.Name);

            var validator = await MissionValidatorFactory.GetValidator(this.ServiceProvider, user);
            var result = false;
            if (validator != null)
            {
                result = await validator.IsMissionValid(missionId, user);
            }

            if (result)
            {
                await this.UsersManager.EndCurrentMission(user.OsmId, user.MissionProgress.History);
            }
            else
            {
                await this.UsersManager.StartMissionAsync(null, user.OsmId);
            }
        }
    }
}