using Business;
using Common;
using Entities;
using Folia;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Ozytis.Common.Core.Storage;
using System.IO;
using Web.Hubs;
using Web.Security;
using Web.Utilities;

namespace Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            this.Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers().AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                options.SerializerSettings.TypeNameHandling = Newtonsoft.Json.TypeNameHandling.Auto;
            });

            this.ConfigureSecurity(services);

            MongoDBConfig config = new MongoDBConfig();
            this.Configuration.Bind("MongoDB", config);
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            services.AddScoped<Entities.DataContext>((_) => new DataContext(config));
            services.AddScoped<UsersManager>();
            services.AddScoped<MissionsManager>();
            services.AddScoped<ObservationsManager>();
            services.AddScoped<SpeciesManager>();
            services.AddScoped<FileManager>();
            services.AddScoped<TrophiesManager>();
            services.AddScoped<TitlesManager>();
            services.AddScoped<FoliaManager>();
            services.AddSignalR();
            services.AddSingleton<HubConnectionManager>();
            services.AddSingleton<HubPositionManager>();
            services.AddSingleton<IUserNotify, NotifyHub>();
            services.AddSingleton<IUserPosition, PositionHub>();

            services.AddScoped<IAuthorizationHandler, RolesAuthorizationHandler>();

            var fs = new FoliaScript(this.Configuration["FoliaPath"]);
            services.AddSingleton<FoliaScript>(fs);

            services.AddSwaggerGen();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();

            app.UseDefaultFiles();

            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = true,
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
            });

            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapFallbackToFile("index.html");
                endpoints.MapHub<NotifyHub>("/notifyhub");
                endpoints.MapHub<PositionHub>("/positionhub");
            });
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
        }

        public void ConfigureSecurity(IServiceCollection services)
        {
            services.AddSingleton<CustomCookieAuthenticationEvents>();
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
            {
                options.LoginPath = "/login";
                options.EventsType = typeof(CustomCookieAuthenticationEvents);
            });

            services.AddAuthorization();
        }
    }
}