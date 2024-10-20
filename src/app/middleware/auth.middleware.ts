import { Request, Response, NextFunction } from "express";

const checkCredentials = (req: Request, res: Response, next: NextFunction) => {
    const credencial = req.headers['credencial'];

    if (!credencial || credencial !== process.env.CHAVE_DE_ACESSO) {
        return res.status(401).json({
            message: 'Propriedade "credencial" ausente no header ou é inválida.'
        });
    }
    next();
};

export { checkCredentials };