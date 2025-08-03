using Movies.Api.Mapping;
using Movies.Application;
using Movies.Application.Database;
using Movies.Application.Options;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
builder.Services.Configure<JwtOptions>(config.GetSection("JwtOptions"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddApplication();
builder.Services.AddDatabase(config["Database:ConnectionString"]!);
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ValidationMappingMiddleware>();
app.MapControllers();

var dbInitializer = app.Services.GetRequiredService<DbInitializer>();
await dbInitializer.InitializeAsync();

app.Run();