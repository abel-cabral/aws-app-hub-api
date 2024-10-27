import { Request, Response } from 'express';
import { downloadFileFromGitHub } from '../service/ec2-service';
import { DockerClass } from '../model/docker.model';

class DockerController {
    async createDockerCompose(req: Request, res: Response) {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ error: 'Verifique o objeto enviado: { fileUrl: string }' });
        }

        try {
            await downloadFileFromGitHub(fileUrl, 'docker-compose.yml');
            res.status(200).json({ message: 'docker-compose.yml gerado com sucesso' });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async inserirServico(req: Request, res: Response) {
        const { nomeServico, tag, image, replicas, memory, ports, envs } = req.body;

        if (!nomeServico || !tag || !image || !replicas || !memory || !ports || !envs || typeof replicas !== 'number') {
            return res.status(400).json({ error: 'Verifique o objeto enviado: { nomeServico: string , tag: string, image: string, replicas: number, memory: string, ports: string, envs: string[] }' });
        }

        const service = new DockerClass(nomeServico, tag, image, replicas, memory, ports, envs);
        try {
            // Adicionar ou modificar o serviço com novas variáveis de ambiente
            try {
                await DockerClass.removerServico(nomeServico);
            } catch (error: any) {
                console.log(error.message);
            }
            const response = await service.inserirServico();
            res.status(200).json({ message: response });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async removerServico(req: Request, res: Response) {
        const { nomeServico } = req.body;

        if (!nomeServico) {
            return res.status(400).json({ error: 'Verifique o objeto enviado: { nomeServico: string }' });
        } 

        try {
            // Adicionar ou modificar o serviço com novas variáveis de ambiente
            const response = await DockerClass.removerServico(nomeServico);
            res.status(200).json({ message: response });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async listarServico(req: Request, res: Response) {
        const arr = ["cleaner", "watchtower", "nginx"];
        try {
            // Adicionar ou modificar o serviço com novas variáveis de ambiente
            const response = await DockerClass.listarServicos();
            const filtrado = response.filter(el => !arr.includes(el.nome))
            res.status(200).json(filtrado);
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }
}

export const dockerController = new DockerController();