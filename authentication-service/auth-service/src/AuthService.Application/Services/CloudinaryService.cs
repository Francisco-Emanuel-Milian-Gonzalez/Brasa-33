using System;
using AuthService.Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;

namespace AuthService.Application.Services;

public class CloudinaryService(IConfiguration configuration) : ICloudinaryService
{
    private readonly Cloudinary _cloudinary = new(
        new Account(
            configuration["CloudinarySettings:CloudName"]
                ?? configuration["CloudinarySettings:Cloudname"]
                ?? throw new InvalidOperationException("Cloudinary CloudName no configurado"),
            configuration["CloudinarySettings:ApiKey"]
                ?? throw new InvalidOperationException("Cloudinary ApiKey no configurado"),
            configuration["CloudinarySettings:ApiSecret"]
                ?? throw new InvalidOperationException("Cloudinary ApiSecret no configurado")
        )
    );

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DelResParams { PublicIds = [publicId] };
            var result = await _cloudinary.DeleteResourcesAsync(deleteParams);
            return result.Deleted?.ContainsKey(publicId) == true;
        }
        catch
        {
            return false;
        }
    }

    public string GetDefaultAvatarUrl()
    {
        var defaultPath =
            configuration["CloudinarySettings:DefaultAvatarPath"]
            ?? "DefaultAvatar_lunlmo.webp";
        return BuildDeliveryUrl(defaultPath);
    }

    private string BuildDeliveryUrl(string path)
    {
        var cloudName =
            configuration["CloudinarySettings:CloudName"]
            ?? configuration["CloudinarySettings:Cloudname"]
            ?? "dcroiajue";
        var baseUrl =
            configuration["CloudinarySettings:BaseUrl"]
            ?? $"https://res.cloudinary.com/{cloudName}/image/upload/";
        var folder = (configuration["CloudinarySettings:Folder"] ?? "auth-b33-in6av/profiles").Trim();

        var pathToUse = path;
        if (!pathToUse.Contains('/'))
            pathToUse = $"{folder}/{pathToUse}";

        return $"{baseUrl}{pathToUse}";
    }

    public string GetFullImageUrl(string imagePath)
    {
        var cloudName =
            configuration["CloudinarySettings:CloudName"]
            ?? configuration["CloudinarySettings:Cloudname"]
            ?? "dcroiajue";
        var baseUrl =
            configuration["CloudinarySettings:BaseUrl"]
            ?? $"https://res.cloudinary.com/{cloudName}/image/upload/";
        var folder = (configuration["CloudinarySettings:Folder"] ?? "auth_brasa33_in6av/profiles").Trim();
        var defaultPath =
            configuration["CloudinarySettings:DefaultPath"] ?? "brasa_33.png";

        var pathToUse = string.IsNullOrEmpty(imagePath) ? defaultPath : imagePath;
        if (!pathToUse.Contains('/'))
            pathToUse = $"{folder}/{pathToUse}";

        return $"{baseUrl}{pathToUse}";
    }

    public async Task<string> UploadImageAsync(IFileData imageFile, string fileName)
    {
        try
        {
            using var stream = new MemoryStream(imageFile.Data);
            var folder = (configuration["CloudinarySettings:Folder"] ?? "auth_brasa33_in6av/profiles").Trim();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                PublicId = $"{folder}/{fileName}",
                Folder = folder,
                Transformation = new Transformation()
                    .Width(400)
                    .Height(400)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto")
                    .FetchFormat("auto"),
            };
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new InvalidOperationException(
                    $"Error al subir la imagen: {uploadResult.Error.Message}"
                );
            }

            return fileName;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Error al subir la imagen a cloudinary: {ex.Message}",
                ex
            );
        }
    }
}
