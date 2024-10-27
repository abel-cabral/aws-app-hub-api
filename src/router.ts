import { Router } from "express";
import { healthController } from "./app/controller/health.controller";
import { dockerController } from "./app/controller/docker.controller";
import { nginxController } from "./app/controller/nginx.controller";
import { ec2Controller } from "./app/controller/ec2.controller";
import { checkCredentials } from "./app/middleware/auth.middleware";

const router: Router = Router();

//Routes
router.get("/api/check/health", checkCredentials, healthController.checkhealth);
router.get("/api/check/memory", checkCredentials, healthController.checkMemory);
router.get("/api/check/disk", checkCredentials, healthController.checkDisk);

router.get("/api/image/list", checkCredentials, ec2Controller.listarImages);
router.delete("/api/image/remove/:id", checkCredentials, ec2Controller.removerImage);
router.post("/api/docker/initCluster", checkCredentials, ec2Controller.iniciarCluster);
router.delete("/api/docker/removeCluster", checkCredentials, ec2Controller.removerCluster);;
router.delete("/api/docker/clean", checkCredentials, ec2Controller.clearDocker);
router.delete("/api/docker/cleanAll", checkCredentials, ec2Controller.clearDockerAllData);

router.post("/api/compose/create", checkCredentials, dockerController.createDockerCompose);
router.put("/api/compose/addService", checkCredentials, dockerController.inserirServico);
router.delete("/api/compose/removeService", checkCredentials, dockerController.removerServico);
router.get("/api/compose/listService", checkCredentials, dockerController.listarServico);

router.post("/api/nginx/create", checkCredentials, nginxController.createNginxConfig);
router.put("/api/nginx/addService", checkCredentials, nginxController.inserirServico);
router.delete("/api/nginx/removeService", checkCredentials, nginxController.removerServico);
router.get("/api/nginx/listService", checkCredentials, nginxController.listarServico);

export { router };
