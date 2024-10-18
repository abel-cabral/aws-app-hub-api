import { Router } from "express";
import { healthController } from "./app/controller/health.controller";
import { dockerController } from "./app/controller/docker.controller";
import { nginxController } from "./app/controller/nginx.controller";
import { ec2Controller } from "./app/controller/ec2.controller";

const router: Router = Router();

//Routes
router.get("/api/check/health", healthController.checkhealth);
router.get("/api/check/memory", healthController.checkMemory);
router.get("/api/check/disk", healthController.checkDisk);

router.get("/api/image/list", ec2Controller.listarImages);
router.delete("/api/image/remove/:id", ec2Controller.removerImage);
router.delete("/api/cluster/remove/:name", ec2Controller.removerCluster)
router.post("/api/docker/initCluster", ec2Controller.iniciarCluster);
router.delete("/api/docker/removeCluster", ec2Controller.removerCluster);;
router.delete("/api/docker/clean", ec2Controller.clearDocker);
router.delete("/api/docker/cleanAll", ec2Controller.clearDockerAllData);

router.post("/api/compose/create", dockerController.createDockerCompose);
router.put("/api/compose/addService", dockerController.inserirServico);
router.delete("/api/compose/removeService", dockerController.removerServico);

router.post("/api/nginx/create", nginxController.createNginxConfig);
router.put("/api/nginx/addService", nginxController.inserirServico);
router.delete("/api/nginx/removeService", nginxController.removerServico);
router.post("/api/nginx/resetNginx", nginxController.reiniciarNginx);

export { router };
