using System.Transactions;
using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class MovieRepository: IMovieRepository
{

    private readonly IDbConnectionFactory _connectionFactory;

    public MovieRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> CreateMovieAsync(Movie movie)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        var result = await connection.ExecuteAsync(new CommandDefinition("""
                                                                         insert into movies (id , slug , title , yearofrelease)
                                                                         values (@Id , @Slug , @Title , @YearOfRelease)
                                                                         """, movie));
        if (result > 0)
        {
            foreach (var genre in movie.Genres)
            {
                await connection.ExecuteAsync(new CommandDefinition("""
                                                                    insert into genres (movieId , name)
                                                                    values (@MovieId , @Name)
                                                                    """, new { MovieId = movie.Id, Name = genre }));
            }
        }
        transaction.Commit();
        return result > 0;
    }

    public async Task<Movie?> GetByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
    
        var movie = await connection.QuerySingleOrDefaultAsync<Movie>("select * from movies where id=@id", new { id });
        if (movie is null) return null;
    
        var genres = await connection.QueryAsync<string>("select name from genres where movieid=@id", new { id });
        movie.Genres.AddRange(genres);

        return movie;
    }

    public async Task<Movie?> GetBySlugAsync(string slug)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
    
        var movie = await connection.QuerySingleOrDefaultAsync<Movie>("select * from movies where slug=@slug", new { slug });
        if (movie is null) return null;
    
        var genres = await connection.QueryAsync<string>("select name from genres where movieid=@id", new { id = movie.Id });
        movie.Genres.AddRange(genres);

        return movie;
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync(new CommandDefinition("""
                                                                       select m.*,string_agg(g.name , ',') as genres
                                                                       from movies m left join genres g on m.id = g.movieid
                                                                       group by id
                                                                       """));
        
        return result.Select(x => new Movie
        {
            Id = x.id,
            Title = x.title,
            YearOfRelease = x.yearofrelease,
            Genres = Enumerable.ToList(x.genres.Split(','))

        });
    }

    public async Task<bool> UpdateMovieAsync(Movie movie)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(new CommandDefinition("""
                                                            delete from genres where movieid = @id
                                                            """, new { id = movie.Id }));

        foreach (var genre in movie.Genres)
        {
            await connection.ExecuteAsync(new CommandDefinition("""
                                                                insert into genres (movieid, name) 
                                                                values (@MoviesId , @Name)
                                                                """, new { MovieId = movie.Id, Name = genre }));
        }
        var result = await connection.ExecuteAsync(new CommandDefinition("""
                                                                             update movies 
                                                                             set slug = @Slug, 
                                                                                 title = @Title, 
                                                                                 yearofrelease = @YearOfRelease
                                                                             where id = @Id
                                                                         """, movie));
        
        transaction.Commit();
        return result > 0;

    }

    public async Task<bool> DeleteMovieByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(new CommandDefinition("""
                                                            delete from genres where movieid = @id
                                                            """, new { id }));

       var result = await connection.ExecuteAsync(new CommandDefinition("""
                                                                        delete from movies where id=@id
                                                                        """, new { id }));
        
        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> ExistsByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        return await connection.ExecuteScalarAsync<bool>(new CommandDefinition("""
                                                                               select count(1) from movies where id = @id
                                                                               """, new { id }));
    }
}