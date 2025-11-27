<img src="https://i.imgur.com/Ty0yh9r.png" width="100%" height="auto">

# Solar-Farm-Blockchain
Code for the .NET Web Services project in the 7th semester.

## Tech Stack
- React
- .NET 8
- MongoDB

## How to build and run the applicaton

### 1. Pull this repository from GitHub
```bash
git clone https://github.com/Pablo1618/Solar-Farm-Blockchain
```
### 2. Build containers
```bash
docker compose up --build
```
> [!IMPORTANT]    
> Wait for containers to build - it can take some time

Once the runtime starts, you can access the project at **http://localhost:5173/**

### 3. Run data generator
Inside the terminal of generator container:
```bash
dotnet /app/DataGeneration.dll
start_all
```
Alternatively you can run sensors individually using commands listed in `Generator/generator_commands`
> [!NOTE]   
> You can find more information about backend and generator in `/backend/README.MD` and `/Generator/README.MD`
> <br>Also you can find example http requests in `backend/SolarFarmBackend.http`