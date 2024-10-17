import * as fs from 'fs';
import * as path from 'path';

const configPath = 'nginx/nginx.conf'

export class NginxClass {
    nomeServico: string | undefined;
    ip: string | undefined;
    porta: string | undefined;
    dominio: string | undefined;

    constructor(nomeServico?: string, dominio?: string, porta?: string, ip?: string) {
        this.nomeServico = nomeServico
        this.porta = porta;
        this.dominio = dominio;
        this.ip = ip;
    }

    addServico() {
        const filePath: string = path.resolve(process.cwd(), configPath);
        
        return new Promise((resolve, reject) => {
            // Lê o arquivo de configuração
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(new Error(`Erro ao ler o arquivo: ${err.message}`));
                    return;
                }
    
                // Verifica se o nome do serviço já existe
                const serviceExists = new RegExp(`\\s*upstream\\s+${this.nomeServico}\\s*\\{`).test(data);
                if (serviceExists) {
                    reject(new Error(`O nome de serviço "${this.nomeServico}" já existe no arquivo.`));
                    return;
                }
    
                // Verifica se a porta já está em uso por outro serviço
                const portRegex = new RegExp(`server\\s+[^:]+:\\s*${this.porta}\\s*;`);
                if (portRegex.test(data)) {
                    reject(new Error(`A porta ${this.porta} já está em uso por outro serviço.`));
                    return;
                }
    
                // Verifica se o domínio já está em uso
                const domainRegex = new RegExp(`\\s*${this.dominio}\\s+\\S+;`);
                if (domainRegex.test(data)) {
                    reject(new Error(`O domínio "${this.dominio}" já está associado a outro serviço.`));
                    return;
                }
    
                // Adiciona o novo upstream na marca 01
                const upstreamToAdd = `    upstream ${this.nomeServico} { server ${this.ip}:${this.porta}; }`;
                const upstreamSection = data.replace(/(# MARCA DE INSERCAO AUTOMATICA 01)/, `$1\n${upstreamToAdd}`);
    
                // Adiciona o novo hostname ao map na marca 02
                const mapToAdd = `        ${this.dominio} ${this.nomeServico};`;
                const mapSection = upstreamSection.replace(/(# MARCA DE INSERCAO AUTOMATICA 02)/, `$1\n${mapToAdd}`);
    
                // Escreve de volta no arquivo
                fs.writeFile(filePath, mapSection, 'utf8', (err) => {
                    if (err) {
                        reject(new Error(`Erro ao escrever no arquivo: ${err.message}`));
                        return;
                    }
                    resolve(`Upstream ${this.nomeServico} e hostname ${this.dominio} adicionados com sucesso.`);
                });
            });
        });
    }

    static removerServico(nomeServico: string) {
        const filePath: string = path.resolve(process.cwd(), configPath);
    
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return reject(new Error(`Erro ao ler o arquivo: ${err.message}`));
                }
        
                // Regex para encontrar e remover o upstream
                const upstreamRegex = new RegExp(`\\s*upstream ${nomeServico} \\{[^\\}]*\\}`, 'g');
                const upstreamMatch = RegExp(upstreamRegex).exec(data);
        
                if (!upstreamMatch) {
                    return reject(new Error(`Upstream "${nomeServico}" não encontrado no arquivo.`));
                }
        
                const updatedUpstreamSection = data.replace(upstreamRegex, '');
        
                // Regex para encontrar e remover a linha no map
                const mapRegex = new RegExp(`\\s*\\b\\S+\\b\\s+${nomeServico};`, 'g');
                const mapMatch = RegExp(mapRegex).exec(updatedUpstreamSection);
        
                if (!mapMatch) {
                    return reject(new Error(`Map para "${nomeServico}" não encontrado no arquivo.`));
                }
        
                const updatedMapSection = updatedUpstreamSection.replace(mapRegex, '');
        
                // Se não houverem alterações, avisar
                if (!upstreamMatch && !mapMatch) {
                    return reject(new Error(`Nenhuma alteração foi feita. O upstream "${nomeServico}" e o map correspondente não foram encontrados.`));
                }
        
                // Escrever de volta no arquivo
                fs.writeFile(filePath, updatedMapSection, 'utf8', (err) => {
                    if (err) {
                        reject(new Error(`Erro ao escrever no arquivo: ${err.message}`));
                    }
                });
                return resolve(`serviço ${nomeServico} foi removido`);
            });
        })
    }
}