using Business;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Controllers
{
    [Route("pictures")]
    public class PicturesController : ControllerBase
    {
        public PicturesController(FileManager fileManager)
        {
            this.FileManager = fileManager;
        }

        public FileManager FileManager { get; }

        [HttpGet()]
        public async Task<IActionResult> GetPicture(string path)
        {
            byte[] data = await this.FileManager.ReadFileAsync(path);
            return File(data, "image/" + Path.GetExtension(path).Substring(0));
        }
    }
}
