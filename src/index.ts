import OcppServer from "@core/WebSocketServer";

const PORT = Number(process.env.PORT) || 3000;
const server = new OcppServer(PORT);

// Handle Ctrl+C / Docker stop / PM2 stop
const shutdownSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

shutdownSignals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\nReceived ${signal}`);
    await server.shutdown();
    process.exit(0);
  });
});