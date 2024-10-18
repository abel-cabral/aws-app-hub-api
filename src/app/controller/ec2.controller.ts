import { exec } from 'child_process';
import { Request, Response } from 'express';

class EC2Controler {
  constructor() {
    // Verifica se Docker Swarm esta inicializado, senão irá inicializar
    exec('if ! docker info | grep -q "Swarm: active"; then docker swarm init; fi');
  }

  public listarImages(req: Request, res: Response) {
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

        res.json(imageList);
      }
    );
  }

  public removerImage(req: Request, res: Response) {
    const { id } = req.params;
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
      res.json(`Image ${id} has been deleted`);
    });
  }

  public iniciarCluster(req: Request, res: Response) {
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
        res.status(200).json(`Iniciando subido do cluster`);
      }
    );
  }

  public removerCluster(req: Request, res: Response) {
    exec('docker stack rm appHubCluster', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar os containers do Podman' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res
          .status(500)
          .json({ error: 'Erro ao listar os containers do Podman' });
      }

      console.log(stdout);
      res.json(`Iniciando remoção do cluster`);
    });
  }

  public clearDocker(req: Request, res: Response) {
    exec('docker system prune -a --volumes -f', (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do Podman' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do Podman' });
        }

        console.log(stdout);
        res.json('Docker cache has been deleted1');
      }
    );
  }

  public clearDockerAllData(req: Request, res: Response) {
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
            .json({ error: 'Erro ao listar os containers do Podman' });
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res
            .status(500)
            .json({ error: 'Erro ao listar os containers do Podman' });
        }

        console.log(stdout);
        res.json('All Docker Data has been deleted');
      }
    );
  }
}

export const ec2Controler = new EC2Controler();
