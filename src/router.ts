import { Router } from "express";
import { apiStatusController } from "./app/controller/api-status-controller";
import { ec2Controler } from './app/controller/ec2-controller';

const router: Router = Router();

//Routes
router.get("/", apiStatusController.health);
router.get("/api/image/list", ec2Controler.listarImages);
router.delete("/api/image/remove/:id", ec2Controler.removerImage);
router.delete("/api/cluster/remove/:name", ec2Controler.removerCluster);
router.delete("/api/docker/clean", ec2Controler.clearDocker);
router.delete("/api/docker/cleanAll", ec2Controler.clearDockerAllData);
router.post("/api/docker/createCompose", ec2Controler.createDockerCompose);

export { router };
