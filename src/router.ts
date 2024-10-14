import { Router } from "express";
import { apiStatusController } from "./app/controller/api-status-controller";
import { ec2Controler } from './app/controller/ec2-controller';

const router: Router = Router();

//Routes
router.get("/", apiStatusController.health);
router.get("/api/listarImagens", ec2Controler.listarImagens);

export { router };
