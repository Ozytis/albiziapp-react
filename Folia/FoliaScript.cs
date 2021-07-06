using Newtonsoft.Json;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;

namespace Folia
{
    public class FoliaScript
    {
        private static Mutex mut = new Mutex();

        public string FoliaPath { get; set; }

        public FoliaScript(string foliaPath)
        {
            this.FoliaPath = foliaPath;
        }

        public FoliaResult Execute(string flowerOrFruitPath, string leafPath, string barkPath)
        {
            string args = "";
            if (!string.IsNullOrEmpty(flowerOrFruitPath))
            {
                args += $"-f {flowerOrFruitPath} ";
            }
            if (!string.IsNullOrEmpty(leafPath))
            {
                args += $"-l {leafPath} ";
            }
            if (!string.IsNullOrEmpty(barkPath))
            {
                args += $"-b {barkPath} ";
            }

            if (string.IsNullOrEmpty(args))
            {
                throw new BusinessException("No args found");
            }
            // args += $"-b {barkPath} ";
            mut.WaitOne();
            try
            {
                ProcessStartInfo start = new ProcessStartInfo();
                start.FileName = "python";
                start.WorkingDirectory = this.FoliaPath;
                Console.WriteLine($"classify.py {args}");
                start.Arguments = $"classify.py {args}";
                start.UseShellExecute = false;
                start.RedirectStandardOutput = true;
                using (Process process = Process.Start(start))
                {
                    using (StreamReader reader = process.StandardOutput)
                    {
                        string result = reader.ReadToEnd();
                        result = result.Replace("\r\n", "").Replace("\r", "").Replace("\n", "");

                        string path = result.Substring(10, result.Length - 10);
                        var json = File.ReadAllText(Path.Combine(this.FoliaPath, path));
                        Console.WriteLine(json);

                        return JsonConvert.DeserializeObject<FoliaResult>(json);
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                mut.ReleaseMutex();
            }
        }
    }
}