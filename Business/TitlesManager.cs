using Entities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class TitlesManager : BaseManager
    {
        public TitlesManager(DataContext dataContext) : base(dataContext)
        {

        }

        public async Task CreateTitleAsync(Title title)
        {
            title.Id = Guid.NewGuid().ToString("N");
            await this.DataContext.Titles.InsertOneAsync(title);
        }

        public async Task<List<Title>> GetTitlesByPoints(int explorationPoints, int knowledgePoints)
        {
            return await this.DataContext.Titles.Find(s => s.ExplorationPoints <= explorationPoints && s.KnowledgePoints <= knowledgePoints).ToListAsync();
        }

        public async Task<List<Title>> GetAllTitlesAsync()
        {
            return await this.DataContext.Titles.Find(_ => true).ToListAsync();
        }
    }
}
