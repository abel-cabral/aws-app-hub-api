import { Request, Response } from 'express';
import { gitHubService } from '../service/ec2-service';
import { NginxClass } from '../model/nginx.model';

class NginxController {
    public async createNginxConfig(req: Request, res: Response) {
        const { filedominio } = req.body;
        try {
            await gitHubService.downloadFileFromGitHub(filedominio);
            res.status(200).json({ message: 'nginx.config file has been create!' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error while creating docker-compose', error: error?.message });
        }
    }

    public async inserirServico(req: Request, res: Response) {
        const { nomeServico, dominio, porta, ip } = req.body;
        const servico = new NginxClass(nomeServico, dominio, porta, ip);
        servico.addServico().then((status) => {
            res.status(200).json({ message: status });
        })
        .catch((error) => {
            res.status(500).json({ error: error?.message });
        });
    }

    public async removerServico(req: Request, res: Response) {
        const { nomeServico } = req.body;
        NginxClass.removerServico(nomeServico)
            .then((status) => {
                res.status(200).json({ message: status });
            })
            .catch((error) => {
                res.status(500).json({ error: error?.message });
            });
    }
}

export const nginxController = new NginxController();