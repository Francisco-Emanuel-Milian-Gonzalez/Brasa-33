using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class UpdateProfileDto
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public IFileData? ProfilePicture { get; set; }
}
