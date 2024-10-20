import express from "express";
import { router } from "./router";
import { healthController } from "./app/controller/health.controller";

healthController.getPublicIP();

const server = express();

// Middleware
server.use(express.json());

// Router
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Aplicação rodando em localhost:${PORT}`);
});