import { Request, Response } from 'express';
import { downloadFileFromGitHub } from '../service/ec2-service';
import { DockerClass } from '../model/docker.model';

class DockerController {
    public async createDockerCompose(req: Request, res: Response) {
        const { fileUrl } = req.body;
        try {
            await downloadFileFromGitHub(fileUrl, 'docker-compose.yml');
            res.status(200).json({ message: 'docker-compose.yml gerado com sucesso' });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    public async atualizarDockerCompose(req: Request, res: Response) {
        const { serviceName, tag, image, replicas, memory, ports, envs } = req.body;
        const service = new DockerClass(serviceName, tag, image, replicas, memory, ports, envs);

        try {
             // Adicionar ou modificar o serviço com novas variáveis de ambiente
            const response = await service.inserirServico();
            res.status(200).json({ message: response });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }
}

export const dockerController = new DockerController();