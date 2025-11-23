FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY "DataGeneration.csproj" .
RUN dotnet restore "DataGeneration.csproj"
COPY . .
RUN rm -rf /src/obj /src/bin
RUN dotnet restore
RUN dotnet publish "DataGeneration.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY run_generator.sh /app/run_generator.sh
RUN chmod +x /app/run_generator.sh
ENTRYPOINT ["/app/run_generator.sh"]
