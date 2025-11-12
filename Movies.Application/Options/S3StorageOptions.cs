namespace Movies.Application.Options;

public class S3StorageOptions
{
    public const string SectionName = "S3";

    public string BucketName { get; init; } = string.Empty;
    public string Region { get; init; } = string.Empty;
    public string AccessKey { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public string? CdnBaseUrl { get; init; }
    public string? Folder { get; init; }
}

