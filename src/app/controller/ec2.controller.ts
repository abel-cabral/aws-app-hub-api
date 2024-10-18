import { exec } from 'child_process';
import { Request, Response } from 'express';

export const ec2Controller =  {
  listarImages(req: Request, res: Response) {
    exec(
      'docker image ls --format "{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}"',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar as imagens Docker' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar as imagens Docker' });
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
      if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar as imagens Docker' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar as imagens Docker' });
      }

      console.log(stdout);
      return res.status(200).json(`Image ${id} has been deleted`);
    });
  },
  iniciarCluster(req: Request, res: Response) {
    exec(
      `docker stack deploy -c docker-compose appHubCluster`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers' });
        }

        console.log(stdout);
        return res.status(200).json(`Iniciando subido do cluster`);
      }
    );
  },
  removerCluster(req: Request, res: Response) {
    exec('docker stack rm appHubCluster', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar os containers do docker' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar os containers do docker' });
      }

      console.log(stdout);
      return res.status(200).json(`Iniciando remoção do cluster`);
    });
  },
  clearDocker(req: Request, res: Response) {
    exec('docker system prune -a --volumes -f', (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do docker' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do docker' });
        }

        console.log(stdout);
        return res.status(200).json('Docker cache has been deleted1');
      }
    );
  },
  clearDockerAllData(req: Request, res: Response) {
    exec(
      `
        docker stop $(docker ps -q) || true
        docker rm $(docker ps -a -q) || true
        docker rmi $(docker images -q) || true
        docker volume rm $(docker volume ls -q) || true
        docker network rm $(docker network ls -q) || true
        docker builder prune -a -f
        sudo rm -rf /var/lib/docker/containers/*/*.log
        sudo rm -rf /var/lib/docker
      `, (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do docker' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do docker' });
        }

        console.log(stdout);
        return res.status(200).json('All Docker Data has been deleted');
      }
    );
  }
}
