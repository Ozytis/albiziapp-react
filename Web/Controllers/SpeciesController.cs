﻿using Api;
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
            var species = await this.SpeciesManager.GetAllSpeciesAsync();

            return species?.OrderBy(s => s.SpeciesName).Select(specy => specy.ToSpeciesModel());
        }

        [HttpGet("{taxonId}")]
        public async Task<SpeciesInfoModel> GetSpeciesInfoAsync(string taxonId)
        {
            var species = await this.SpeciesManager.SelectByTaxonAsync(taxonId);

            return species?.ToSpeciesInfoModel();
        }

        [HttpPost]
        [ValidateModel, HandleBusinessException]
        public async Task CreateSpeciesAsync([FromBody] SpeciesCreationModel model)
        {
            await this.SpeciesManager.CreateOrUpdateSpeciesAsync(new Species
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
            }, model.Pictures);
        }

        [HttpGet("keys")]
        public async Task<FloraKeyModel[]> GetFloraKeysAsync()
        {
            var keys = await this.SpeciesManager.GetAllFloraKeysAsync();

            return keys.OrderBy(k => k.Order).Select(key => key.ToFloraKeyModel()).ToArray();
        }

        [HttpPost("keys")]
        [ValidateModel, HandleBusinessException]
        public async Task CreateFloraKeyAsync([FromBody] FloraKeyCreationModel model)
        {
            await this.SpeciesManager.CreateOrUpdateFloraKeyAsync(
                new FloraKey
                {
                    FrSubTitle = model.FrSubTitle,
                    FrTitle = model.FrTitle,
                    NormalizedForm = model.NormalizedForm,
                    Order = model.Order
                },
                model.Values?.Select(value => new FloraKeyValue
                {
                    Id = value.Id,
                    NormalizedForm = value.NormalizedForm
                }).ToArray()
            );
        }
    }
}
