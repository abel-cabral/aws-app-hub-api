import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const configPath = 'docker-compose.yml';

export class DockerClass {
    nomeServico: string;
    tag: string;
    image: string;
    replicas: number;
    memory: string;
    ports: Array<string>; // Mantido como Array<string>
    envs: Array<string>;

    constructor(
        nomeServico: string,
        tag: string,
        image: string,
        replicas: number,
        memory: string,
        ports: string[], // Aqui ainda usamos string[], mas será tratado como lista
        envs: string[]
    ) {
        this.nomeServico = nomeServico;
        this.tag = tag;
        this.image = image;
        this.replicas = replicas;
        this.memory = memory;
        this.ports = ports; // Armazena como uma lista
        this.envs = envs;
    }

    inserirServico(parallelism = 1) {
        // Caminho para o arquivo docker-compose.yml
        const filePath: string = path.resolve(process.cwd(), configPath);

        return new Promise((resolve, reject) => {
            try {
                // 1. Ler o arquivo YAML
                const fileContents = fs.readFileSync(filePath, 'utf8');

                // 2. Fazer o parse do YAML para um objeto JavaScript
                const composeFile: DockerCompose = yaml.load(fileContents) as DockerCompose;

                // 3. Preparar os dados do novo serviço com base nos atributos da instância
                const newServiceData = {
                    image: `${this.image}:${this.tag}`, // Usa os atributos da classe
                    deploy: {
                        replicas: this.replicas,
                        update_config: {
                            parallelism: parallelism,
                            delay: '10s'
                        },
                        resources: {
                            limits: {
                                memory: this.memory
                            }
                        }
                    },
                    ports: this.ports.map(port => port.toString()), // Garantindo que seja um array de strings
                    environment: this.envs
                };

                // 4. Verificar se o serviço já existe
                if (composeFile.services[this.nomeServico]) {
                    const service = composeFile.services[this.nomeServico];

                    // Atualiza as variáveis de ambiente se existir
                    if (!service.environment) {
                        service.environment = [];
                    }
                    service.environment.push(...this.envs);

                    // Atualiza as portas se existir, garantindo que seja uma lista
                    if (!service.ports) {
                        service.ports = [];
                    }
                    service.ports.push(...this.ports.map(port => port.toString())); // Garante que as portas sejam adicionadas como strings
                } else {
                    // Adicionar novo serviço
                    composeFile.services[this.nomeServico] = newServiceData;
                }

                // 5. Converter o objeto modificado de volta para YAML
                const newYaml = yaml.dump(composeFile, { lineWidth: -1 });

                // 6. Escrever o novo conteúdo de volta ao arquivo
                fs.writeFileSync(filePath, newYaml, 'utf8');
                resolve(`Serviço '${this.nomeServico}' modificado ou adicionado com sucesso!`);
            } catch (error) {
                reject(new Error('Um erro ocorreu ao inserir serviço no docker-compose.yml'));
            }
        });
    }

    static removerServico(nomeServico: string) {
        // Caminho para o arquivo docker-compose.yml
        const filePath: string = path.resolve(process.cwd(), configPath);
    
        return new Promise((resolve, reject) => {
            try {
                // 1. Ler o arquivo YAML
                const fileContents = fs.readFileSync(filePath, 'utf8');
    
                // 2. Fazer o parse do YAML para um objeto JavaScript
                const composeFile = yaml.load(fileContents) as any;
    
                // 3. Verificar se o serviço existe
                if (!composeFile.services) {
                    reject(new Error(`Serviço '${nomeServico}' não encontrado.`));
                    return;
                }
    
                // 4. Remover o serviço
                delete composeFile.services[nomeServico];
    
                // 5. Converter o objeto modificado de volta para YAML
                const newYaml = yaml.dump(composeFile, { lineWidth: -1 });
    
                // 6. Escrever o novo conteúdo de volta ao arquivo
                fs.writeFileSync(filePath, newYaml, 'utf8');
                resolve(`Serviço ${nomeServico} removido com sucesso!`);
            } catch (error) {
                reject(new Error('Um erro ocorreu ao remover o serviço do docker-compose.yml'));
            }
        });
    }
}

// Interface do Docker Compose
export interface DockerCompose {
    version: string;
    services: {
        [key: string]: {
            image: string; // Image é obrigatória
            deploy?: {
                replicas: number;
                update_config?: {
                    parallelism: number;
                    delay: string;
                };
                resources?: {
                    limits: {
                        memory: string;
                    };
                };
            };
            ports?: Array<string>; // Mantido como Array<string>
            environment?: string[];
        };
    };
}