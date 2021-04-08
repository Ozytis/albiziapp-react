using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Buffers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Web.Utilities
{
    public class JsonTypeNameHandlingOutputAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext ctx)
        {
            if (ctx.Result is ObjectResult objectResult)
            {
                objectResult.Formatters.Add(new NewtonsoftJsonOutputFormatter(
                new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                },
                ctx.HttpContext.RequestServices.GetRequiredService<ArrayPool<char>>(),
                ctx.HttpContext.RequestServices.GetRequiredService<IOptions<MvcOptions>>().Value));
            }
        }
    }
}