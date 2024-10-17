import { Request, Response } from 'express';
import { gitHubService } from '../service/ec2-service';
import { DockerClass } from '../model/docker.model';

class DockerController {
    public async createDockerCompose(req: Request, res: Response) {
        const { fileUrl } = req.body;
        try {
            await gitHubService.downloadFileFromGitHub(fileUrl);
            res.status(200).json({ message: 'docker-compose file has been create!' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error while creating docker-compose', error: error?.message });
        }
    }

    public atualizarDockerCompose() {
        const env: Array<string> = [
            'DATABASE=mongodb+srv://<CENSURADO>@cluster0.mongodb.net/blink',
            'API_KEY=someApiKey'
        ];
        const service = new DockerClass(
            'teste-de-api',
            'latest',
            'ozteps/blink-api',
            1,
            '128M',
            '5002:8080',
            env
        );
        
        // Adicionar ou modificar o serviço com novas variáveis de ambiente
        service.inserirServico(2);
    }
}

export const dockerController = new DockerController();