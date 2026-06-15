# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Packages.props ./
COPY Ordovita.Domain/Ordovita.Domain.csproj Ordovita.Domain/
COPY Ordovita.Application/Ordovita.Application.csproj Ordovita.Application/
COPY Ordovita.Infrastructure/Ordovita.Infrastructure.csproj Ordovita.Infrastructure/
COPY Ordovita.Api/Ordovita.Api.csproj Ordovita.Api/

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore Ordovita.Api/Ordovita.Api.csproj

COPY . .
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore Ordovita.Api/Ordovita.Api.csproj && \
    dotnet publish Ordovita.Api/Ordovita.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD wget -qO- http://127.0.0.1:8080/health | grep -q ok || exit 1

ENTRYPOINT ["dotnet", "Ordovita.Api.dll"]
