import { exec } from "child_process";
import { Request, Response } from "express";

class EC2Controler {
  public listarImagens(req: Request, res: Response) {
    exec('podman image ls --format "{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}"', (error, stdout, stderr) => {
      if (error) {
          console.error(`Erro ao executar o comando: ${error.message}`);
          return res.status(500).json({ error: 'Erro ao listar as imagens Docker' });
      }
      if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res.status(500).json({ error: 'Erro ao listar as imagens Docker' });
      }

      const imageList = stdout.split('\n').filter(line => line).map(line => {
        console.log(line)
          const [image, tag, id,size, tio] = line.split(' ');
          return { image, tag, id, size, tio };
      });

      res.json(imageList);
    });
  }
}

export const ec2Controler = new EC2Controler();
