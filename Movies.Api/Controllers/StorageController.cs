using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Movies.Application.Interfaces;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/storage")]
public class StorageController : ControllerBase
{
    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<StorageController> _logger;

    public StorageController(IFileStorageService fileStorageService, ILogger<StorageController> logger)
    {
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpPost("posters")]
    [Authorize(Roles = "admin")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSizeBytes)]
    public async Task<IActionResult> UploadPoster([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Файл не найден." });
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return BadRequest(new { message = "Размер файла превышает допустимый предел (5MB)." });
            }

            var contentType = file.ContentType.ToLowerInvariant();
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (Array.IndexOf(AllowedContentTypes, contentType) < 0)
            {
                // Проверяем также по расширению файла
                if (fileExtension != ".jpg" && fileExtension != ".jpeg" && fileExtension != ".png" && fileExtension != ".webp")
                {
                    return BadRequest(new { message = "Поддерживаются только изображения JPEG, PNG или WEBP." });
                }
            }

            await using var stream = file.OpenReadStream();
            // Не добавляем префикс "posters/" здесь, так как BuildObjectKey добавит его из конфигурации
            var key = $"{Guid.NewGuid():N}{fileExtension}";

            var url = await _fileStorageService.UploadFileAsync(stream, file.ContentType, key, cancellationToken);

            _logger.LogInformation("File uploaded successfully: {Url}", url);
            return Ok(new { url });
        }
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "S3 error occurred while uploading file");
            
            var errorMessage = s3Ex.ErrorCode switch
            {
                "NoSuchBucket" => "Bucket не найден. Проверьте название bucket в настройках.",
                "AccessDenied" => "Доступ запрещен. Проверьте права доступа IAM пользователя.",
                "InvalidAccessKeyId" => "Неверный Access Key. Проверьте настройки S3.",
                "SignatureDoesNotMatch" => "Неверный Secret Key. Проверьте настройки S3.",
                "AccessControlListNotSupported" => "Bucket не поддерживает ACL. Код исправлен. Настройте Bucket Policy для публичного доступа (см. S3_TROUBLESHOOTING.md).",
                _ => $"Ошибка S3: {s3Ex.Message}. Код ошибки: {s3Ex.ErrorCode}"
            };

            return StatusCode(500, new { 
                message = errorMessage,
                error = s3Ex.Message,
                errorCode = s3Ex.ErrorCode,
                requestId = s3Ex.RequestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while uploading file");
            return StatusCode(500, new { 
                message = "Ошибка при загрузке файла", 
                error = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }
}

