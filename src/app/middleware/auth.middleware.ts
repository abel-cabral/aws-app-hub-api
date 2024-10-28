import { Request, Response, NextFunction } from "express";
import * as path from 'path';
import * as fs from 'fs';

const configPath = 'credencial.txt';

const checkCredentials = async (req: Request, res: Response, next: NextFunction) => {
    const credencial = req.headers['credencial'] as string; // Assegura que credencial é uma string
    const localCredencial = await readFileCredencial();
    
    if (!credencial) {
        return res.status(401).json({
            message: 'Propriedade "credencial" ausente no header.'
        });
    }

    console.log(localCredencial)
    
    if (credencial !== localCredencial) {
        return res.status(401).json({
            message: 'Credencial inválida.'
        });
    }
    
    next();
};

const readFileCredencial = async () => {
    const filePath: string = path.resolve(process.cwd(), configPath);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return data.trim(); // Remove espaços em branco ao redor
    } catch (err: any) {
        console.error('Erro ao ler o arquivo de credenciais:', err.message);
        return null; // Retorna null em caso de erro
    }
};

export { checkCredentials };