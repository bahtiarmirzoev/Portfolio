using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Movies.Application.Interfaces;
using Movies.Application.Options;

namespace Movies.Api.Services;

public class S3FileStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3StorageOptions _options;
    private readonly ILogger<S3FileStorageService> _logger;

    public S3FileStorageService(IAmazonS3 s3Client, IOptions<S3StorageOptions> options, ILogger<S3FileStorageService> logger)
    {
        _s3Client = s3Client;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(Stream stream, string contentType, string key, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("Key must be provided", nameof(key));
        }

        var normalizedKey = BuildObjectKey(key);

        _logger.LogInformation("Uploading file to S3. Bucket: {Bucket}, Key: {Key}, ContentType: {ContentType}", 
            _options.BucketName, normalizedKey, contentType);

        try
        {
            // Создаем запрос без CannedACL, так как bucket не поддерживает ACL
            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = normalizedKey,
                InputStream = stream,
                ContentType = contentType
                // Не устанавливаем CannedACL - публичный доступ настраивается через Bucket Policy
            };

            // Явно не устанавливаем ACL
            request.CannedACL = null;
            
            request.Metadata.Add("x-amz-meta-uploaded-at", DateTime.UtcNow.ToString("O"));

            var response = await _s3Client.PutObjectAsync(request, cancellationToken);

            var fileUrl = BuildFileUrl(normalizedKey);
            _logger.LogInformation("File uploaded successfully. URL: {Url}, ETag: {ETag}", fileUrl, response.ETag);

            return fileUrl;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "S3 error: {ErrorCode}, {Message}, Bucket: {Bucket}, Region: {Region}", 
                ex.ErrorCode, ex.Message, _options.BucketName, _options.Region);
            throw;
        }
    }

    private string BuildObjectKey(string key)
    {
        var trimmedKey = key.TrimStart('/');

        if (!string.IsNullOrWhiteSpace(_options.Folder))
        {
            var folder = _options.Folder!.Trim('/');
            return string.IsNullOrEmpty(folder) ? trimmedKey : $"{folder}/{trimmedKey}";
        }

        return trimmedKey;
    }

    private string BuildFileUrl(string key)
    {
        if (!string.IsNullOrWhiteSpace(_options.CdnBaseUrl))
        {
            return $"{_options.CdnBaseUrl!.TrimEnd('/')}/{key}";
        }

        return $"https://{_options.BucketName}.s3.{_options.Region}.amazonaws.com/{key}";
    }
}

