import { exec } from 'child_process';
import { Request, Response } from 'express';

export const ec2Controller =  {
  listarImages(req: Request, res: Response) {
    exec(
      'docker image ls --format "{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}"',
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(`Stderr: ${stderr}`);
          console.error(`Erro ao executar o comando: ${error?.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao executar o comando' });
        }

        const imageList = stdout
          .split('\n')
          .filter((line) => line)
          .map((line) => {
            const [imageWithTag, id, size, unit] = line.split(' ');
            const [image, tag] = imageWithTag.split(':');
            return { image, tag, id, size, unit };
          });

          console.log(stdout);
          return res.status(200).json(imageList);
      }
    );
  },
  removerImage(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Verifique o objeto enviado: { id: string' });
    } 

    exec('docker image rm ' + id, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`Stderr: ${stderr}`);
        console.error(`Erro ao executar o comando: ${error?.message}`);
        return res
          .status(500)
          .json({ error: 'Erro ao executar o comando' });
      }

      console.log(stdout);
      return res.status(200).json(`Image ${id} has been deleted`);
    });
  },
  iniciarCluster(req: Request, res: Response) {
    exec(
      `docker stack deploy -c docker-compose.yml appHubCluster`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(`Stderr: ${stderr}`);
          console.error(`Erro ao executar o comando: ${error?.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao executar o comando' });
        }

        console.log(stdout);
        return res.status(200).json(`Iniciando subido do cluster`);
      }
    );
  },
  removerCluster(req: Request, res: Response) {
    exec('docker stack rm appHubCluster', (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`Stderr: ${stderr}`);
        console.error(`Erro ao executar o comando: ${error?.message}`);
        return res
          .status(500)
          .json({ error: 'Erro ao executar o comando' });
      }

      console.log(stdout);
      return res.status(200).json(`Iniciando remoção do cluster`);
    });
  },
  clearDocker(req: Request, res: Response) {
    exec('docker system prune -a --volumes -f', (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(`Stderr: ${stderr}`);
          console.error(`Erro ao executar o comando: ${error?.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao executar comando' });
        }

        console.log(stdout);
        return res.status(200).json('Docker cache has been deleted1');
      }
    );
  },
  clearDockerAllData(req: Request, res: Response) {
    exec(`
      yes | docker stop $(docker ps -q) &&
      yes | docker rm $(docker ps -a -q) &&
      yes | docker rmi $(docker images -q) &&
      yes | docker volume rm $(docker volume ls -q) &&
      yes | docker network rm $(docker network ls -q) &&
      yes | docker builder prune -a -f &&
      sudo rm -rf /var/lib/docker/containers/*/*.log &&
      sudo rm -rf /var/lib/docker
    `, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        return res.status(500).json({ error: 'Erro ao executar os comandos' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ error: `Erro no Docker: ${stderr}` });
      }
    
      console.log(`Saída: ${stdout}`);
      return res.status(200).json('All Docker Data has been deleted');
    });
  }
}
