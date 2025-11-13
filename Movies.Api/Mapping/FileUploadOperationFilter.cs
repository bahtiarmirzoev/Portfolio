using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Movies.Api.Mapping;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Проверяем, есть ли параметры типа IFormFile через ApiDescription
        var hasFormFile = context.ApiDescription.ParameterDescriptions
            .Any(p => p.Type == typeof(IFormFile) || p.Type == typeof(IFormFileCollection));

        if (!hasFormFile)
            return;

        // Получаем параметры из MethodInfo
        var fileParams = context.MethodInfo.GetParameters()
            .Where(p => p.ParameterType == typeof(IFormFile) || p.ParameterType == typeof(IFormFileCollection))
            .ToList();

        if (!fileParams.Any())
            return;

        // Удаляем все параметры, связанные с файлами, из operation.Parameters
        if (operation.Parameters != null)
        {
            var paramsToRemove = operation.Parameters
                .Where(p => fileParams.Any(fp => fp.Name == p.Name))
                .ToList();
            
            foreach (var param in paramsToRemove)
            {
                operation.Parameters.Remove(param);
            }
        }

        // Создаем RequestBody для multipart/form-data
        var properties = new Dictionary<string, OpenApiSchema>();
        var required = new HashSet<string>();

        foreach (var param in fileParams)
        {
            var paramName = param.Name ?? "file";
            properties[paramName] = new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            };
            
            // IFormFile не может быть nullable, поэтому всегда required
            required.Add(paramName);
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = properties,
                        Required = required
                    }
                }
            }
        };
    }
}

