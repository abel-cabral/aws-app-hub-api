import * as fs from 'fs';
import * as path from 'path';

const configPath = 'nginx/nginx.conf';

export class NginxClass {
    ip = process.env.IPADDRESS
    nomeServico: string | undefined;
    porta: string | undefined;
    dominio: string | undefined;

    constructor(
        nomeServico?: string,
        dominio?: string,
        porta?: string
    ) {
        this.nomeServico = nomeServico;
        this.porta = porta;
        this.dominio = dominio;
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
                const serviceExists = new RegExp(
                    `\\s*upstream\\s+${this.nomeServico}\\s*\\{`
                ).test(data);
                if (serviceExists) {
                    reject(
                        new Error(
                            `O nome de serviço "${this.nomeServico}" já existe no arquivo.`
                        )
                    );
                    return;
                }

                // Verifica se a porta já está em uso por outro serviço
                const portRegex = new RegExp(`server\\s+[^:]+:${this.porta}\\s*;`);
                if (portRegex.test(data)) {
                    reject(
                        new Error(`A porta ${this.porta} já está em uso por outro serviço.`)
                    );
                    return;
                }

                // Verifica se o domínio já está em uso
                const domainRegex = new RegExp(`\\s*${this.dominio}\\s+\\S+;`);
                if (domainRegex.test(data)) {
                    reject(
                        new Error(
                            `O domínio "${this.dominio}" já está associado a outro serviço.`
                        )
                    );
                    return;
                }

                // Adiciona o novo upstream na marca 01
                const upstreamToAdd = `    upstream ${this.nomeServico} { server ${this.ip}:${this.porta}; }`;
                const upstreamSection = data.replace(
                    /(# MARCA DE INSERCAO AUTOMATICA 01)/,
                    `$1\n${upstreamToAdd}`
                );

                // Adiciona o novo bloco de server na marca 02
                const serverBlockToAdd = `
        server {
            listen 80;
            server_name ${this.dominio};
            location / {
                proxy_pass http://${this.nomeServico};
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;  # Use o esquema da requisição original (http ou https)
            }
        }`;

                // Adiciona o bloco do servidor na posição correta
                const finalConfig = upstreamSection.replace(
                    /(# MARCA DE INSERCAO AUTOMATICA 02)/,
                    `$1\n${serverBlockToAdd}`
                );

                // Escreve de volta no arquivo
                fs.writeFile(filePath, finalConfig, 'utf8', (err) => {
                    if (err) {
                        reject(new Error(`Erro ao escrever no arquivo: ${err.message}`));
                        return;
                    }
                    resolve(
                        `Upstream ${this.nomeServico} e servidor ${this.dominio} adicionados com sucesso.`
                    );
                });
            });
        });
    }

    static removerServico(nomeServico: string) {
        const filePath: string = path.resolve(process.cwd(), configPath);

        return new Promise((resolve) => {
            // Removido o reject
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    // Se ocorrer um erro ao ler o arquivo, rejeitamos a promessa
                    return resolve(`Erro ao ler o arquivo: ${err.message}`);
                }

                // Regex para encontrar e remover o upstream
                const upstreamRegex = new RegExp(
                    `\\s*upstream ${nomeServico} \\{[^\\}]*\\}`,
                    'g'
                );
                const upstreamMatch = upstreamRegex.exec(data);

                // Se o upstream não for encontrado, logar e continuar
                if (!upstreamMatch) {
                    console.log(
                        `Upstream "${nomeServico}" não encontrado no arquivo. Nenhuma alteração feita.`
                    );
                    return resolve(
                        `Upstream "${nomeServico}" não encontrado. Nenhuma alteração foi feita.`
                    );
                }

                const updatedUpstreamSection = data.replace(upstreamRegex, '');

                // Regex para encontrar e remover a linha no map
                const mapRegex = new RegExp(`\\s*\\b\\S+\\b\\s+${nomeServico};`, 'g');
                const mapMatch = mapRegex.exec(updatedUpstreamSection);

                // Se o map não for encontrado, logar e continuar
                if (!mapMatch) {
                    console.log(
                        `Map para "${nomeServico}" não encontrado no arquivo. Nenhuma alteração feita.`
                    );
                    return resolve(
                        `Map para "${nomeServico}" não encontrado. Nenhuma alteração foi feita.`
                    );
                }

                const updatedMapSection = updatedUpstreamSection.replace(mapRegex, '');

                // Escrever de volta no arquivo
                fs.writeFile(filePath, updatedMapSection, 'utf8', (err) => {
                    if (err) {
                        return resolve(`Erro ao escrever no arquivo: ${err.message}`);
                    }
                    resolve(`Serviço "${nomeServico}" foi removido com sucesso.`);
                });
            });
        });
    }
}
