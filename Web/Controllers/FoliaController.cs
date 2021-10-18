using Api;
using Business;
using Folia;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Utilities;
using Ozytis.Common.Core.Web.WebApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class FoliaController : ControllerBase
    {
        public FoliaManager FoliaManager { get; }
        public SpeciesManager SpeciesManager { get; }

        public FoliaController(FoliaManager foliaManager, SpeciesManager speciesManager)
        {
            this.FoliaManager = foliaManager;
            this.SpeciesManager = speciesManager;
        }

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task<FoliaResultModel[]> Request([FromBody] FoliaRequestModel model)
        {
            try
            {
                var species = await this.SpeciesManager.GetAllSpeciesAsync();
                var result = await this.FoliaManager.Request(model.FlowerOrFruitImage, model.LeafPath, model.BarkPath,this.User.Identity.Name);
                List<FoliaResultModel> foliaResults = new List<FoliaResultModel>();
                for (var i = 0; i < result.Species.Count; i++)
                {
                    var r = result.Species[i];
                    var foliaResult = new FoliaResultModel
                    {
                        Species = r,
                        Probability = result.Probability[i],
                        SpeciesId = species.FirstOrDefault(x => r.ToLower() == x.SpeciesName?.ToLower().Replace(" ", ""))?.TelaBotanicaTaxon
                    };
                    foliaResults.Add(foliaResult);
                }
                return foliaResults.ToArray();
            }
            catch (AbandonedMutexException ame)
            {
                throw new BusinessException("Erreur avec Folia");
            }
            catch (Exception ame)
            {
                throw new BusinessException("Erreur avec Folia");
            }
        }
    }
}