using Microsoft.Extensions.DependencyInjection;
using Movies.Application.Repositories;

namespace Movies.Application;

public static class ApplicationServiceCollectionExstensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IMovieRepository, MovieRepository>();
        return services;
    }
}