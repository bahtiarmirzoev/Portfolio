using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Movies.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream stream, string contentType, string key, CancellationToken cancellationToken = default);
}

