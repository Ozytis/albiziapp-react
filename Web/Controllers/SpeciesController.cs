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
    public class SpeciesController : ControllerBase
    {
        public SpeciesController(SpeciesManager speciesManager)
        {
            this.SpeciesManager = speciesManager;
        }

        public SpeciesManager SpeciesManager { get; }

        [HttpGet]
        public async Task<IEnumerable<SpeciesModel>> GetAllSpeciesAsync()
        {
            IEnumerable<Species> species = await this.SpeciesManager.GetAllSpeciesAsync();

            return species?.OrderBy(s => s.SpeciesName).Select(specy => specy.ToSpeciesModel());
        }

        [HttpGet("{taxonId}")]
        public async Task<SpeciesInfoModel> GetSpeciesInfoAsync(string taxonId)
        {
            Species species = await this.SpeciesManager.SelectByTaxonAsync(taxonId);

            return species?.ToSpeciesInfoModel();
        }

        [HttpPost]
        [ValidateModel, HandleBusinessException]
        public async Task CreateSpeciesAsync([FromBody] SpeciesCreationModel model)
        {
            await this.SpeciesManager.CreateOrUpdateSpeciesAsync(
                new Species
                {
                    CommonGenus = model.CommonGenus,
                    CommonSpeciesName = model.CommonSpeciesName,
                    Description = model.Description,
                    Genus = model.Genus,
                    Habitat = model.Habitat,
                    SpeciesName = model.SpeciesName,
                    TelaBotanicaTaxon = model.TelaBotanicaTaxon,
                    Usage = model.Usage,
                    FloraKeyValues = model.FloraKeyValues?.ToList()
                },
                model.Pictures);
        }

        [HttpPost("rarety")]
        [ValidateModel, HandleBusinessException]
        public async Task UpdateRaretySpeciesAsync([FromBody] RaretyCreationModel model)
        {
            await this.SpeciesManager.UpdateSpeciesRarety(
                new Species
                {SpeciesName=model.Value,
                Rarity = model.Rarety,
                Difficult = 2
                });
        }

        [HttpGet("keys")]
        public async Task<FloraKeyModel[]> GetFloraKeysAsync()
        {
            IEnumerable<FloraKey> keys = await this.SpeciesManager.GetAllFloraKeysAsync();

            return keys.OrderBy(k => k.Order).Select(key => key.ToFloraKeyModel()).ToArray();
        }

        [HttpPost("keys")]
        [ValidateModel, HandleBusinessException]
        public async Task CreateFloraKeyAsync([FromBody] FloraKeyCreationModel model)
        {
            FloraKeyValue[] values = model.Values?.Select(value => new FloraKeyValue
            {
                Id = value.Id,
                NormalizedForm = value.NormalizedForm
            }).ToArray();

            FloraKey key = new FloraKey
            {
                FrSubTitle = model.FrSubTitle,
                FrTitle = model.FrTitle,
                NormalizedForm = model.NormalizedForm,
                Order = model.Order
            };

            await this.SpeciesManager.CreateOrUpdateFloraKeyAsync(key, values);
        }
    }
}
