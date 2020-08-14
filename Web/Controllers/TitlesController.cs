using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api;
using Business;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class TitlesController : Controller
    {

        public TitlesController(TitlesManager titlesManager)
        {
            this.TitlesManager = titlesManager;
        }

        public TitlesManager TitlesManager { get; }

        [HttpPost]
        [HandleBusinessException, ValidateModel]
        public async Task CreateTitleAsync([FromBody] TitleCreationModel model)
        {
            await this.TitlesManager.CreateTitleAsync(new Title
            {
                Name = model.Name,
                ExplorationPoints = model.ExplorationPoints,
                KnowledgePoints = model.KnowledgePoints
            });
        }
    }
}
