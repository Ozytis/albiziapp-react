using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web.Mappings;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class ObservationsController : ControllerBase
    {
        public ObservationsController(ObservationsManager observationsManager)
        {
            this.ObservationsManager = observationsManager;
        }

        public ObservationsManager ObservationsManager { get; }

        [HttpGet("")]
        public async Task<IEnumerable<ObservationModel>> GetAllObservations()
        {
            IEnumerable<Observation> observations = await this.ObservationsManager.GetAllObservations();

            return observations.Select(observation => observation.ToObservationModel());
        }

        [HttpGet("/api/users/{userId}/observations")]
        public async Task<IEnumerable<ObservationModel>> GetUserObservations(string userId)
        {
            IEnumerable<Observation> observations = await this.ObservationsManager.GetUserObservations(userId);
            return observations.Select(observation => observation.ToObservationModel());
        }

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateObservationAysnc([FromBody] ObservationCreationModel model)
        {
            await this.ObservationsManager.CreateObservationAsync(
                new Observation
                {
                    Genus = model.Genus,
                    Confident = model.IsConfident,
                    Latitude = model.Latitude,
                    Longitude = model.Longitude,
                    SpeciesName = model.Species,
                    UserId = this.User.Identity.Name,
                },
                new[] { model.Image });
        }

        [HttpDelete("{observationId}")]
        [HandleBusinessException, ValidateModel]
        public async Task DeleteObservationAsync(string observationId)
        {
            await this.ObservationsManager.DeleteObservationAsync(observationId, this.User.Identity.Name);
        }
    }
}
