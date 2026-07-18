FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AuthService.sln ./
COPY src/AuthService.Api/AuthService.Api.csproj src/AuthService.Api/
COPY src/AuthService.Application/AuthService.Application.csproj src/AuthService.Application/
COPY src/AuthService.Domain/AuthService.Domain.csproj src/AuthService.Domain/
COPY src/AuthService.Persistence/AuthService.Persistence.csproj src/AuthService.Persistence/
RUN dotnet restore AuthService.sln

COPY . .
RUN find . -type d \( -iname "bin" -o -iname "obj" \) -prune -exec rm -rf {} + \
    && dotnet restore AuthService.sln \
    && dotnet publish src/AuthService.Api/AuthService.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:5218
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5218

ENTRYPOINT ["dotnet", "AuthService.Api.dll"]