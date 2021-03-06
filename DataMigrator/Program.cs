﻿using Api;
using Api.Missions;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DataMigrator
{
    internal class Program
    {
        private static string URL = "http://localhost:5100";

        private static async Task Main(string[] args)
        {
            Console.WriteLine("Quelle est l'URL du site (http://localhost:5100 par défaut si vide) :");

            var newUrl = Console.ReadLine();
            if (!string.IsNullOrEmpty(newUrl))
            {
                if (Uri.IsWellFormedUriString(newUrl, UriKind.Absolute))
                {
                    URL = newUrl;
                }
                else
                {
                    Console.WriteLine("Url incorrecte,l'url de base va être utilisé");
                }
            }
            Console.WriteLine("L'url du serveur utilisé sera : " + URL);

            while (true)
            {
                Console.WriteLine("Veuillez choisir une opération :");
                Console.WriteLine("\t1 - Essences d'arbres");
                Console.WriteLine("\t2 - Clef de détermination");
                Console.WriteLine("\t3 - Trophée");
                Console.WriteLine("\t4 - Titre");
                Console.WriteLine("\t5 - Rareté");
                Console.WriteLine("\t6 - Mission v2");
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

                    case '3':
                        await MigrateTrophies();
                        break;

                    case '4':
                        await MigrateTitles();
                        break;

                    case '5':
                        await MigrateRarety();
                        break;

                    case '6':
                        await MigrateMissionv2();
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
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/species"), Encoding.UTF8.GetBytes(json));
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
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/species/keys"), Encoding.UTF8.GetBytes(json));
                    }

                    Console.WriteLine(key.Prop.NormalizedForm);
                }
            }
        }

        private static async Task MigrateMission()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "mission.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();

            int order = 1;
            //List<ActivityCreationModel> activities = new List<ActivityCreationModel>();
            //while (jsonReader.Read())
            //{
            //    if (jsonReader.TokenType == JsonToken.StartObject)
            //    {
            //        ActivityCreationModel key = serializer.Deserialize<ActivityCreationModel>(jsonReader);
            //        key.Order = order;
            //        activities.Add(key);
            //        order++;
            //        Console.WriteLine(key.Instructions.Long);
            //    }
            //}
            //MissionCreationModel model = new MissionCreationModel();
            //model.Order = 1;
            //model.Activities = activities.ToArray();
            string json = "";//; JsonConvert.SerializeObject(model);
            using (WebClient webClient = new WebClient())
            {
                webClient.Headers.Add("Accept", "text/json");
                webClient.Headers.Add("Content-Type", "text/json");
                await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/missions"), Encoding.UTF8.GetBytes(json));
            }
        }

        private static async Task MigrateTrophies()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "trophy.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();

            while (jsonReader.Read())
            {
                if (jsonReader.TokenType == JsonToken.StartObject)
                {
                    TrophyCreationModel trophy = serializer.Deserialize<TrophyCreationModel>(jsonReader);
                    Console.WriteLine(JsonConvert.SerializeObject(trophy));
                    string json = JsonConvert.SerializeObject(trophy);
                    using (WebClient webClient = new WebClient())
                    {
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/trophies"), Encoding.UTF8.GetBytes(json));
                    }
                }
            }
        }

        private static async Task MigrateTitles()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "title.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();

            while (jsonReader.Read())
            {
                if (jsonReader.TokenType == JsonToken.StartObject)
                {
                    TitleCreationModel title = serializer.Deserialize<TitleCreationModel>(jsonReader);
                    Console.WriteLine(JsonConvert.SerializeObject(title));
                    string json = JsonConvert.SerializeObject(title);
                    using (WebClient webClient = new WebClient())
                    {
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/titles"), Encoding.UTF8.GetBytes(json));
                    }
                }
            }
        }

        private static async Task MigrateRarety()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "rarete.json"));
            using JsonTextReader jsonReader = new JsonTextReader(reader);

            jsonReader.SupportMultipleContent = true;

            JsonSerializer serializer = new JsonSerializer();

            while (jsonReader.Read())
            {
                if (jsonReader.TokenType == JsonToken.StartObject)
                {
                    RaretyCreationModel rarety = serializer.Deserialize<RaretyCreationModel>(jsonReader);
                    Console.WriteLine(JsonConvert.SerializeObject(rarety));
                    string json = JsonConvert.SerializeObject(rarety);
                    using (WebClient webClient = new WebClient())
                    {
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/species/rarety"), Encoding.UTF8.GetBytes(json));
                    }
                }
            }
        }

        private static async Task MigrateMissionv2()
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "Migrate", "missionv2.json"));
            var json = await reader.ReadToEndAsync();

            var data = JsonConvert.DeserializeObject<MissionModel[]>(json, new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.All
            });
            foreach (var m in data)
            {
                try
                {
                    using (WebClient webClient = new WebClient())
                    {
                        string missionJson = JsonConvert.SerializeObject(m, new JsonSerializerSettings
                        {
                            TypeNameHandling = TypeNameHandling.All
                        });
                        webClient.Headers.Add("Accept", "text/json");
                        webClient.Headers.Add("Content-Type", "text/json");
                        await webClient.UploadDataTaskAsync(new Uri($"{URL}/api/missions/createMissionFromApi"), Encoding.UTF8.GetBytes(missionJson));
                    }
                }
                catch (Exception e)
                {
                }
            }

            //Console.WriteLine(json);
        }
    }
}