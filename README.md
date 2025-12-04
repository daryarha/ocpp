## Table of Contents
- [Installation](#installation)
- [Check data](#Checkdata)
- [Architecture](#architecture)

## Installation

1. Make sure the **Docker** is available in local before running the project
2. Clone the repo:
   ```bash
   git clone git@github.com:daryarha/ocpp.git
3. Run the app:
   ```bash
   docker compose up -d
4. Simulate the server using this:
    https://ocpp-simulator.vercel.app/settings
    With settings:
    - Address: `localhost`
    - Port: `3000`
    - RFID Tag:  `zR9d6pBVii2Hv7lnexyK`
    (this can change if needed in the docker/init/02_data.sql for `Authorize`)


## Checkdata
1. Make sure the app is running by checking:
    ```bash
    docker logs ocpp_server
2. Use this cmd to access database in docker:
    ```bash
    docker exec -it ocpp_db psql -U ocpp -d ocpp
    
## Architecture
Business flow:
Client (create map for each charging point) -> Websocket Server (validate schema & catch error) -> Router (route based on request action index 2 in CALL) -> Handler (parse data) -> Service (apply business logic) -> Repo (get data based on business logic needs) -> Database

| Folder | Responsibility |
|--------|----------------|
| **core/** | Core of the project — database connection, WebSocket server, WebSocket client for each charging point |
| **repositories/** | Database access layer — SQL queries and data persistence |
| **services/** | Business logic — processing rules based on OCPP actions |
| **handlers/** | Parse and validate payloads from client before calling service |
| **router/** | Routes requests based on OCPP action index in CALL message |
| **types/** | Shared TypeScript types used across the system |
| **validation/** | Request schema validation (Zod) |
| **docker/init/** | Seed scripts & initial data for local testing environment |


OCPP Implementation Details, including:
- BootNotification
- Heartbeat
- Authorize
- StatusNotification
- StartTransaction
- StopTransaction
- MeterValues, using timescale hypertable to handle high volume data, with compression to reduce storage size and improve perfomance