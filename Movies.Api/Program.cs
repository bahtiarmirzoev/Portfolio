using System;
using System.Security.Claims;
using System.Text;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Movies.Api.Mapping;
using Movies.Api.Services;
using Movies.Application;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Application.Options;
using Movies.Application.Repositories;
using Movies.Application.Services;
using Movies.Application.Validators;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

builder.Services.Configure<JwtOptions>(config.GetSection("JwtOptions"));
builder.Services.Configure<S3StorageOptions>(config.GetSection(S3StorageOptions.SectionName));
builder.Services.Configure<AiOptions>(config.GetSection(AiOptions.SectionName));

// AWS S3 Configuration
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var options = sp.GetRequiredService<IOptions<S3StorageOptions>>().Value;

    if (string.IsNullOrWhiteSpace(options.BucketName) ||
        string.IsNullOrWhiteSpace(options.Region) ||
        string.IsNullOrWhiteSpace(options.AccessKey) ||
        string.IsNullOrWhiteSpace(options.SecretKey))
    {
        throw new InvalidOperationException("S3 configuration is missing. Please set S3:BucketName, Region, AccessKey and SecretKey in configuration.");
    }

    var credentials = new BasicAWSCredentials(options.AccessKey, options.SecretKey);
    var region = RegionEndpoint.GetBySystemName(options.Region);
    return new AmazonS3Client(credentials, region);
});

builder.Services.AddSingleton<IFileStorageService, S3FileStorageService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // 🔹 Add JWT support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token.\n\nExample: Bearer 12345abcdef"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // 🔹 Configure Swagger to handle file uploads
    c.MapType<Microsoft.AspNetCore.Http.IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
    
    // Используем CustomOperationIds для правильной обработки операций
    c.CustomOperationIds(apiDesc => apiDesc.TryGetMethodInfo(out var methodInfo) 
        ? methodInfo.Name 
        : null);
    
    c.OperationFilter<FileUploadOperationFilter>();
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Настройка лимитов для загрузки файлов
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 5 * 1024 * 1024; // 5 MB
    options.ValueLengthLimit = 5 * 1024 * 1024;
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddApplication();
builder.Services.AddDatabase(config["Database:ConnectionString"]!);


// 🔴 ИСПРАВЬ ЭТИ СТРОЧКИ:
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuthService, AuthService>(); 
builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
builder.Services.AddTransient<IEmailService, EmailService>();

// ✅ ДОБАВЬ ЭТИ РЕГИСТРАЦИИ:
builder.Services.AddScoped<IOtpRepository, OtpRepository>(); // 🔴 ВАЖНО: интерфейс, а не класс
builder.Services.AddScoped<IOtpService, OtpService>();       // 🔴 ВАЖНО: интерфейс, а не класс



builder.Services.AddScoped<IFavoriteRepository , FavoriteRepository>();
builder.Services.AddScoped<IFavoriteService, FavoriteService>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IActorRepository, ActorRepository>();
builder.Services.AddScoped<IPasswordResetRepository, PasswordResetRepository>();
builder.Services.AddScoped<ISeriesRepository, SeriesRepository>();
builder.Services.AddScoped<ISeriesService, SeriesService>();
builder.Services.AddScoped<IValidator<Series>, SeriesValidator>();
builder.Services.AddScoped<ISeriesRatingRepository, SeriesRatingRepository>();
builder.Services.AddScoped<ISeriesRatingService, SeriesRatingService>();
builder.Services.AddScoped<ISeriesCommentRepository, SeriesCommentRepository>();
builder.Services.AddScoped<ISeriesCommentService, SeriesCommentService>();

// AI Assistant Service
builder.Services.AddHttpClient<IAiAssistantService, AiAssistantService>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<AiOptions>>().Value;
    client.Timeout = TimeSpan.FromSeconds(60);
    
    // Устанавливаем BaseAddress в зависимости от провайдера
    var baseUrl = options.Provider.ToLower() switch
    {
        "groq" => "https://api.groq.com",
        "huggingface" => "https://api-inference.huggingface.co",
        "openai" => "https://api.openai.com",
        _ => "https://api.groq.com"
    };
    client.BaseAddress = new Uri(baseUrl);
    
    if (!string.IsNullOrEmpty(options.ApiKey))
    {
        // Для Hugging Face используется заголовок "Authorization" с Bearer токеном
        // Для Groq и OpenAI тоже используется "Authorization"
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {options.ApiKey}");
    }
    
    // Hugging Face требует дополнительный заголовок
    if (options.Provider.ToLower() == "huggingface")
    {
        client.DefaultRequestHeaders.Add("Accept", "application/json");
    }
});

var jwtSettings = config.GetSection("JwtOptions");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            
            RoleClaimType = "Role",
            NameClaimType = "userId"
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.UseMiddleware<ValidationMappingMiddleware>();
app.MapControllers();

var dbInitializer = app.Services.GetRequiredService<DbInitializer>();
await dbInitializer.InitializeAsync();


app.Run();