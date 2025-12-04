## Table of Contents
- [Installation](#installation)
- [Check data](#Checkdata)
- [Architecture](#architecture)

## Installation

1. Make sure the docker is available in local before running the project
2. Clone the repo:
   ```bash
   git clone git@github.com:daryarha/ocpp.git
3. Run the app:
   ```bash
   docker compose up -d
4. Simulate the server using this:
    https://ocpp-simulator.vercel.app/settings
    With settings:
    Address:
    ```localhost
    Port:
    ```3000
    RFID Tag (can change if needed in the docker/init/02_data.sql for Authorize):
    ```zR9d6pBVii2Hv7lnexyK


## Checkdata
1. Make sure the app is running by checking:
    ```bash
    docker logs ocpp_server
2. Use this cmd to access database in docker:
    ```bash
    docker exec -it ocpp_db psql -U ocpp -d ocpp
    
## Architecture
Business flow:
Client (create map for each charging point) -> Websocket Server (validate schema & catch error) -> Router (route based on request action index 2 in CALL) -> Handler (parse data) -> Service (check business logic) -> Repo (get data based on business logic needs) -> Database

In this project, the architecture is split in each folder:
- Core for the heart of project, including database connection, websocket server and client for each charging point
- Repositories for database access
- Service for business logic
- Handler for handling data parse from user
- Router for routing
- Types for data structure used in the whole project
- Validation for data validation
- Docker/init for data seed testing

OCPP Implementation Details, including:
- BootNotification
- Heartbeat
- Authorize
- StatusNotification
- StartTransaction
- StopTransaction
- MeterValues, using timescale to handle high volume data, with compression to reduce storage size and improve perfomance