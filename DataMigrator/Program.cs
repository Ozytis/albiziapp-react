using Api;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace DataMigrator
{
    internal class Program
    {
        private static async Task Main(string[] args)
        {

            while (true)
            {
                Console.WriteLine("Veuillez choisir une opération :");
                Console.WriteLine("\t1 - Essences d'arbres");
                Console.WriteLine("\t2 - Clef de détermination");
                Console.WriteLine("\tQ - Quitter");

                ConsoleKeyInfo key = Console.ReadKey();

                Console.WriteLine("");

                switch (key.KeyChar)
                {
                    case '1':
                        await MigrateSpeciesAsync();
                        break;
                    case '2':
                        await MigrateFloraKeysAsync();
                        break;
                    case 'q':
                        return;
                    default:
                        Console.WriteLine("Commande non prise en charge");
                        break;
                }

                Console.WriteLine("Opération terminée");
            }
        }

        private static async Task MigrateSpeciesAsync()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "species.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();
            while (jsonReader.Read())
            {
                if (jsonReader.TokenType == JsonToken.StartObject)
                {
                    OldSpecies species = serializer.Deserialize<OldSpecies>(jsonReader);

                    string json = JsonConvert.SerializeObject(new SpeciesCreationModel
                    {
                        CommonGenus = species.Common_genus,
                        CommonSpeciesName = species.Common,
                        Description = species.Description,
                        Genus = species.Genus,
                        Habitat = species.Habitat,
                        Pictures = species.Images,
                        SpeciesName = species.Species,
                        TelaBotanicaTaxon = species.TelaBotanicaTaxon.ToString(),
                        Usage = species.Usage,
                        FloraKeyValues = species.FloreProperties.Select(p => p.Property).ToArray()
                    });

                    using (WebClient webClient = new WebClient())
                    {
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri("https://localhost:5001/api/species"), Encoding.UTF8.GetBytes(json));
                    }

                    Console.WriteLine(species.Common + " " + species.Common_genus);
                }
            }

        }

        private static async Task MigrateFloraKeysAsync()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "floraKeys.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();

            int order = 1;

            while (jsonReader.Read())
            {
                if (jsonReader.TokenType == JsonToken.StartObject)
                {
                    OldFloraKey key = serializer.Deserialize<OldFloraKey>(jsonReader);

                    string json = JsonConvert.SerializeObject(new FloraKeyCreationModel
                    {
                        FrSubTitle = key.Prop.FrSubTitle,
                        FrTitle = key.Prop.FrTitle,
                        NormalizedForm = key.Prop.NormalizedForm,
                        Order = order++,
                        Values = key.Values?.Select(value => new FloraKeyValueCreationModel
                        {
                            Id = value.Id,
                            NormalizedForm = value.NormalizedForm
                        }).ToArray()
                    });

                    using (WebClient webClient = new WebClient())
                    {
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri("https://localhost:5001/api/species/keys"), Encoding.UTF8.GetBytes(json));
                    }

                    Console.WriteLine(key.Prop.NormalizedForm);
                }
            }
        }
    }
}
