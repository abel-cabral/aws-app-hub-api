import { Router } from "express";
import { healthController } from "./app/controller/health.controller";
import { ec2Controler } from './app/controller/ec2.controller';
import { dockerController } from "./app/controller/docker.controller";
import { nginxController } from "./app/controller/nginx.controller";

const router: Router = Router();

//Routes
router.get("/api/check/health", healthController.checkhealth);
router.get("/api/check/memory", healthController.checkMemory);
router.get("/api/check/disk", healthController.checkDisk);

router.get("/api/image/list", ec2Controler.listarImages);
router.delete("/api/image/remove/:id", ec2Controler.removerImage);
router.delete("/api/cluster/remove/:name", ec2Controler.removerCluster)
router.delete("/api/docker/initCluster", ec2Controler.iniciarCluster);
router.delete("/api/docker/removeCluster", ec2Controler.removerCluster);;
router.delete("/api/docker/clean", ec2Controler.clearDocker);
router.delete("/api/docker/cleanAll", ec2Controler.clearDockerAllData);

router.post("/api/compose/create", dockerController.createDockerCompose);
router.put("/api/compose/addService", dockerController.inserirServico);
router.delete("/api/compose/removeService", dockerController.removerServico);

router.post("/api/nginx/create", nginxController.createNginxConfig);
router.put("/api/nginx/addService", nginxController.inserirServico);
router.delete("/api/nginx/removeService", nginxController.removerServico);
router.post("/api/nginx/resetNginx", nginxController.reiniciarNginx);

export { router };
