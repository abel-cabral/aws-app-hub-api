import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const configPath = 'docker-compose.yml'

export class DockerClass {
    serviceName: string;
    tag: string;
    image: string;
    replicas: number;
    memory: string;
    ports: string;
    envs: Array<string>;

    constructor(
        serviceName: string,
        tag: string,
        image: string,
        replicas: number,
        memory: string,
        ports: string,
        envs: string[]
    ) {
        this.serviceName = serviceName;
        this.tag = tag;
        this.image = image;
        this.replicas = replicas;
        this.memory = memory;
        this.ports = ports;
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
                    ports: this.ports,
                    environment: this.envs
                };

                // 4. Verificar se o serviço já existe
                if (composeFile.services[this.serviceName]) {
                    const service = composeFile.services[this.serviceName];

                    // Atualiza as variáveis de ambiente se existir
                    if (!service.environment) {
                        service.environment = [];
                    }
                    service.environment.push(...this.envs);
                } else {
                    // Adicionar novo serviço
                    composeFile.services[this.serviceName] = newServiceData;
                }

                // 5. Converter o objeto modificado de volta para YAML
                const newYaml = yaml.dump(composeFile, { lineWidth: -1 });

                // 6. Escrever o novo conteúdo de volta ao arquivo
                fs.writeFileSync(filePath, newYaml, 'utf8');
                resolve(`Serviço '${this.serviceName}' modificado ou adicionado com sucesso!`);
            } catch (error) {
                reject(new Error('Um erro ocorreu ao inserir serviço no docker-compose.yml'))
            }
        });
    }

    static removerServico(serviceName: string) {
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
                    reject(new Error(`Serviço '${serviceName}' não encontrado.`));
                    return;
                }
    
                // 4. Remover o serviço
                delete composeFile.services[serviceName];
    
                // 5. Converter o objeto modificado de volta para YAML
                const newYaml = yaml.dump(composeFile, { lineWidth: -1 });
    
                // 6. Escrever o novo conteúdo de volta ao arquivo
                fs.writeFileSync(filePath, newYaml, 'utf8');
                resolve(`Serviço ${serviceName} removido com sucesso!`);
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
            ports?: string;
            environment?: string[];
        };
    };
}
