using Microsoft.AspNetCore.Mvc;
using Movies.Application.Models;

namespace Movies.Api;

public class ApiEndpoints
{
    private const string ApiBase = "api";

    public static class Movies
    {
        private const string Base = $"{ApiBase}/movies";

        public const string Create = Base;
        
        public const string Get = $"{Base}/{{id:guid}}";
        
        public const string GetAll =  Base;
        
        public const string Update = $"{Base}/{{id:guid}}";
        
        public const string Delete = $"{Base}/{{id:guid}}";

    }
}