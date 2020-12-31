using Api;
using Business;
using Common;
using Entities;
using Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Utilities;
using Ozytis.Common.Core.Web.WebApi;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Web.Hubs;
using Web.Mappings;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class ObservationsController : ControllerBase
    {
        public ObservationsController(ObservationsManager observationsManager, UsersManager userManager,FileManager fileManager, IUserNotify userNotify)
        {
            this.ObservationsManager = observationsManager;
            this.FileManager = fileManager;
            this.UserNotify = userNotify;
            this.UsersManager = userManager;
        }

        public FileManager FileManager { get; }

        public IUserNotify UserNotify { get; }

        public ObservationsManager ObservationsManager { get; }

        public UsersManager UsersManager { get; }

        [HttpGet("")]
        public async Task<IEnumerable<ObservationModel>> GetAllObservations()
        {
            IEnumerable<Observation> observations = await this.ObservationsManager.GetAllObservations();
            var userIds = observations.SelectMany(o => this.ObservationsManager.GetAllUserIdForObservation(o)).Distinct().ToArray();
            var users = (await this.UsersManager.GetUsersByOsmIds(userIds)).ToArray();
            return observations.Select(observation => observation.ToObservationModel(users));
        }

        [HttpGet("observationId/{observationId}")]
        public async Task<ObservationModel> GetObservationById(string observationId)
        {
            Observation observation = await this.ObservationsManager.GetObservationbyId(observationId);
            var userIds = this.ObservationsManager.GetAllUserIdForObservation(observation).ToArray();
            var users = (await this.UsersManager.GetUsersByOsmIds(userIds)).ToArray();
            return observation.ToObservationModel(users);

        }


        [HttpGet("/api/users/{userId}/observations")]
        public async Task<IEnumerable<ObservationModel>> GetUserObservations(string userId)
        {
            IEnumerable<Observation> observations = await this.ObservationsManager.GetUserObservations(userId);
            var userIds = observations.SelectMany(o => this.ObservationsManager.GetAllUserIdForObservation(o)).Distinct().ToArray();
            var users = (await this.UsersManager.GetUsersByOsmIds(userIds)).ToArray();
            return observations.Select(observation => observation.ToObservationModel(users));
        }
        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateObservationAysnc([FromBody] ObservationCreationModel model)
        {

            await this.ObservationsManager.CreateObservationAsync( model.Species,model.Genus, this.User.Identity.Name,(Confident?)model.IsConfident,model.Latitude,model.Longitude,
                  model.Pictures );
        }

        [HttpPost("addStatement/{observationId}")]
        [HandleBusinessException, ValidateModel]
        public async Task CreateStatementAysnc([FromBody] ObservationCreationModel model, string observationId)
        {
            try
            {
                await this.ObservationsManager.AddStatement(observationId, model, this.User.Identity.Name);
            }
            catch (BusinessException be) {
                
                await this.UserNotify.SendErrorNotif(this.User.Identity.Name, be.Message);
                throw be;
            }
        }

        [HttpPost("confirmStatement")]
        [HandleBusinessException, ValidateModel]
        public async Task ConfirmStatementAysnc([FromBody] AddObservationStatementConfirmationModel osc)
        {

            await this.ObservationsManager.ConfirmStatement(osc.ObservationId, osc.StatementId, this.User.Identity.Name, osc.IsOnlyGenus);
                await this.UserNotify.SendNotif(this.User.Identity.Name, "Le relevé a bien été confirmé");

        }
        [HttpGet("picture/{observationId}/{index}")]
        [HandleBusinessException, ValidateModel]
        public async Task<IActionResult> GetFirstObservationPicture(string observationId, int index)
        {
            
            var observation = await this.ObservationsManager.GetUserObservationbyId(observationId);
            if (observation.Pictures.Any())
            {
                var picturePath = observation.Pictures.ElementAt(index);
                
                byte[] data = await this.FileManager.ReadFileAsync(picturePath);
                return this.File(data, "image/" + Path.GetExtension(picturePath).Substring(0));
            }

            return null;
        }

        [HttpPut]
        [HandleBusinessException, ValidateModel]
        public async Task EditObservationAysnc([FromBody] ObservationEditionModel model)
        {
          /*  await this.ObservationsManager.EditObservationAsync(
                new Observation
                {
                    Id = model.Id,
                    Genus = model.Genus,
                    Confident = (Confident?) model.IsConfident,
                    Latitude = model.Latitude,
                    Longitude = model.Longitude,
                    SpeciesName = model.Species,
                    UserId = this.User.Identity.Name,
                },
                 model.Pictures , this.User.Identity.Name);*/
        }

        [HttpDelete("{observationId}")]
        [HandleBusinessException, ValidateModel]
        public async Task DeleteObservationAsync(string observationId)
        {
            await this.ObservationsManager.DeleteObservationAsync(observationId, this.User.Identity.Name);
        }

        [HttpPut("validate/{observationId}")]
        [HandleBusinessException, ValidateModel]
        public async Task ValidateObservationAsync(string observationId)
        {
            await this.ObservationsManager.VaidateObservationAsync(observationId, this.User.Identity.Name);
        }

        [HttpPost("errorNotif/{userId}/{error}")]
        [HandleBusinessException, ValidateModel]
        public void NotifyError(string userId, string error)
        {
            this.UserNotify.SendErrorNotif(userId, error);
        }

        [HttpPost("infoNotif/{userId}/{error}")]
        [HandleBusinessException, ValidateModel]
        public void NotifyInfo(string userId, string error)
        {
            this.UserNotify.SendInfoNotif(userId, error);
        }
    }
}
