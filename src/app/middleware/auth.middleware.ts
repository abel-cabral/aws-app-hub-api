import { Request, Response, NextFunction } from "express";

const checkCredentials = (req: Request, res: Response, next: NextFunction) => {
    const credencial = req.headers['credencial'];

    if (!credencial || credencial !== readFileCredencial()) {
        return res.status(401).json({
            message: 'Propriedade "credencial" ausente no header ou é inválida.'
        });
    }
    next();
};

const readFileCredencial = () => {
    const filePath = './credencial.txt';
    try {
        let credencial = require('fs').readFileSync(filePath, 'utf8');
        return credencial;
    } catch (err: any) {
        console.log(err?.message)
        return
    }
};

export { checkCredentials };