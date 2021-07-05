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
        public FoliaManager(FoliaScript folia, FileManager fileManager)
        {
            this.Folia = folia;
            this.FileManager = fileManager;
        }

        public FoliaScript Folia { get; }
        public FileManager FileManager { get; }

        public async Task<FoliaResult> Request(string flowerOrFruitImage, string leafImage, string barkImage)
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

            return this.Folia.Execute(flowerOrfruitPath, leafPath, barkPath);
        }
    }
}