import { Request, Response } from 'express';
import { gitHubService } from '../service/ec2-service';
import { DockerComposeClass } from '../model/docker-compose-model';

class DockerComposeController {
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
        const service = new DockerComposeClass(
            'teste-de-api',
            'latest',
            'ozteps/blink-api',
            4,
            10,
            '128M',
            '5002:8080'
        );
        
        // Adicionar ou modificar o serviço com novas variáveis de ambiente
        service.inserirServico([
            'DATABASE=mongodb+srv://<CENSURADO>@cluster0.mongodb.net/blink',
            'API_KEY=someApiKey'
        ]);
    }
}

export const dockerComposeController = new DockerComposeController();