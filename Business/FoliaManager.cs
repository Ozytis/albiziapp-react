using Entities;
using Folia;
using Ozytis.Common.Core.Storage;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class FoliaManager
    {
        public FoliaManager(FoliaScript folia, FileManager fileManager,UsersManager usersManager)
        {
            this.Folia = folia;
            this.FileManager = fileManager;
            this.UsersManager = usersManager;
        }

        public FoliaScript Folia { get; }
        public FileManager FileManager { get; }
        public UsersManager UsersManager { get; }

        public async Task<FoliaResult> Request(string flowerOrFruitImage, string leafImage, string barkImage,string userId )
        {
            string flowerOrfruitPath = null, leafPath = null, barkPath = null;
            if (!string.IsNullOrEmpty(flowerOrFruitImage))
            {
                flowerOrfruitPath = await this.FileManager.SaveDataUrlAsFileAsync("folia", flowerOrFruitImage);
                flowerOrfruitPath = await this.FileManager.GetRealPath(flowerOrfruitPath);
            }

            if (!string.IsNullOrEmpty(leafImage))
            {
                leafPath = await this.FileManager.SaveDataUrlAsFileAsync("folia", leafImage);
                leafPath = await this.FileManager.GetRealPath(leafPath);
            }

            if (!string.IsNullOrEmpty(barkImage))
            {
                barkPath = await this.FileManager.SaveDataUrlAsFileAsync("folia", barkImage);
                barkPath = await this.FileManager.GetRealPath(barkPath);
            }
            var points = new List<PointHistory>();
            points.Add(new PointHistory { Point = 2, Type = (int)KnowledgePoint.UseFolia, Date = DateTime.UtcNow });
            await this.UsersManager.AddKnowledegePoints(userId, points);
            return this.Folia.Execute(flowerOrfruitPath, leafPath, barkPath);
        }
    }
}