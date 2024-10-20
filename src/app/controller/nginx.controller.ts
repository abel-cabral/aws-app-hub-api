import { Request, Response } from 'express';
import { NginxClass } from '../model/nginx.model';
import { exec } from 'child_process';
import { downloadFileFromGitHub } from '../service/ec2-service';

class NginxController {
    async createNginxConfig(req: Request, res: Response) {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ error: 'Verifique o objeto enviado: { fileUrl: string' });
        } 

        try {
            await downloadFileFromGitHub(fileUrl, 'nginx/nginx.conf');
            res.status(200).json({ message: 'nginx.config gerado com sucesso' });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async inserirServico(req: Request, res: Response) {
        const { nomeServico, dominio, porta } = req.body;

        if (!nomeServico || !dominio || !porta) {
            return res.status(400).json({ error: 'Verifique o objeto enviado: { nomeServico: string , dominio: string, porta: string }' });
        } 

        const servico = new NginxClass(nomeServico, dominio, porta);
        try {
            await NginxClass.removerServico(nomeServico);
            const response = await servico.addServico();
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
            const status = await NginxClass.removerServico(nomeServico);
            return res.status(200).json({ message: status });
        } catch (error: any) {
            // Aqui você pode enviar uma resposta adequada para erros
            return res.status(500).json({ error: error?.message });
        }
    }

    reiniciarNginx(req: Request, res: Response) {
        exec('systemctl reload nginx', (error, stdout, stderr) => {
            if (error) {
                return res
                    .status(500)
                    .json({ error: error.message });
            }
            if (stderr) {
                return res
                    .status(500)
                    .json({ error: stderr });
            }
            res.json(`Serviço Nginx Reiniciado`);
        });
    }
}

export const nginxController = new NginxController();
