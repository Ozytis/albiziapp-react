using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api;
using Business;
using Common;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Ozytis.Common.Core.Web.WebApi;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    public class TitlesController : Controller
    {

        public TitlesController(TitlesManager titlesManager,IUserNotify userNotify)
        {
            this.TitlesManager = titlesManager;
            this.UserNotify = userNotify;
        }

        public TitlesManager TitlesManager { get; }

        public IUserNotify UserNotify { get; }

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

        [HttpGet]
        public async Task<TitleModel[]> GetTitles()
        {
            return (await this.TitlesManager.GetAllTitlesAsync()).Select(x => new TitleModel { Id = x.Id, Name = x.Name }).ToArray();
        }
        
    }
}
