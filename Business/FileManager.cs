using Microsoft.Extensions.Configuration;
using Ozytis.Common.Core.Utilities;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Business
{
    public class FileManager
    {
        public FileManager(IConfiguration configuration)
        {
            this.Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public async Task SaveFileAsync(string path, byte[] data)
        {
            string fileName = Path.Combine(this.Configuration["ContentDir"], path);
            await File.WriteAllBytesAsync(fileName, data);
        }

        public async Task<byte[]> ReadFileAsync(string path)
        {
            string fileName = Path.Combine(this.Configuration["ContentDir"], path);
            return await File.ReadAllBytesAsync(fileName);
        }

        public async Task<string> SaveDataUrlAsFileAsync(string directory, string dataUrl)
        {
            string trueDirectory = Path.Combine(this.Configuration["ContentDir"], directory);

            if (!Directory.Exists(trueDirectory))
            {
                Directory.CreateDirectory(trueDirectory);
            }

            if (string.IsNullOrEmpty(dataUrl) || !dataUrl.StartsWith("data:"))
            {
                throw new ArgumentException("Mauvaise data url", nameof(dataUrl));
            }

            string mimeType = dataUrl.Substring("data:".Length, dataUrl.IndexOf(";") - "data:".Length);

            string dataString = dataUrl.Substring(dataUrl.IndexOf(",") + 1);
            string hash = dataString.HashString("MD5");

            byte[] data = Convert.FromBase64String(dataString);

            string fileType = mimeType.Split("/".ToCharArray())[1].ToLowerInvariant();
            string fileName = $"{hash}.{fileType}";

            string path = Path.Combine(trueDirectory, fileName);

            if (!File.Exists(path))
            {
                await this.SaveFileAsync(path, data);
            }

            return Path.Combine(directory, fileName);
        }
    }
}
