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
    ports: string[];
    envs: string[];

    constructor(
        nomeServico: string,
        tag: string,
        image: string,
        replicas: number,
        memory: string,
        ports: string[],
        envs: string[]
    ) {
        this.nomeServico = nomeServico;
        this.tag = tag;
        this.image = image;
        this.replicas = replicas;
        this.memory = memory;
        this.ports = ports;
        this.envs = envs;
    }

    async inserirServico(parallelism = 1): Promise<string> {
        const filePath: string = path.resolve(process.cwd(), configPath);
    
        try {
            const composeFile = DockerClass.carregarYaml(filePath);
    
            // Verifica se as portas já estão em uso por outros serviços
            const portasEmUso = new Set<string>();
            for (const serviceName in composeFile.services) {
                const service = composeFile.services[serviceName];
                if (service.ports) {
                    service.ports.forEach(port => portasEmUso.add(port.toString()));
                }
            }
    
            // Checa se alguma porta do novo serviço já está em uso
            for (const port of this.ports) {
                if (portasEmUso.has(port.toString())) {
                    throw new Error(`A porta ${port} já está em uso por outro serviço.`);
                }
            }
    
            // Prepara os dados do novo serviço
            const newServiceData = this.criarDadosServico(parallelism);
    
            // Atualiza ou adiciona o serviço
            if (composeFile.services[this.nomeServico]) {
                this.atualizarServicoExistente(composeFile.services[this.nomeServico]);
            } else {
                composeFile.services[this.nomeServico] = newServiceData;
            }
    
            DockerClass.salvarYaml(filePath, composeFile);
            return `Serviço '${this.nomeServico}' modificado ou adicionado com sucesso!`;
        } catch (error: any) {
            throw new Error(`Um erro ocorreu ao inserir o serviço no docker-compose.yml: ${error.message}`);
        }
    }

    private criarDadosServico(parallelism: number) {
        return {
            image: `${this.image}:${this.tag}`,
            deploy: {
                replicas: this.replicas,
                update_config: { parallelism, delay: '10s' },
                resources: { limits: { memory: this.memory } }
            },
            ports: this.ports.map(port => port.toString()),
            environment: this.envs
        };
    }

    private atualizarServicoExistente(service: any) {
        service.environment = service.environment || [];
        service.environment.push(...this.envs);

        service.ports = service.ports || [];
        service.ports.push(...this.ports.map(port => port.toString()));
    }

    static async removerServico(nomeServico: string): Promise<any> {
        const filePath: string = path.resolve(process.cwd(), configPath);
    
        try {
            // 1. Carrega o YAML do docker-compose
            const composeFile: any = DockerClass.carregarYaml(filePath);
    
            // 2. Verifica se existe a seção 'services' e se o serviço especificado existe
            if (!composeFile.services || !composeFile.services[nomeServico]) {
                throw new Error(`Serviço '${nomeServico}' não encontrado no arquivo docker-compose.yml.`);
            }
    
            // 3. Remove o serviço do arquivo docker-compose
            delete composeFile.services[nomeServico];
    
            // 4. Verifica se há outros serviços restantes, caso contrário, remove a chave 'services'
            if (Object.keys(composeFile.services).length === 0) {
                delete composeFile.services;
            }
    
            // 5. Salva o YAML atualizado no arquivo
            DockerClass.salvarYaml(filePath, composeFile);
    
            return `Serviço '${nomeServico}' removido com sucesso!`;
        } catch (error: any) {
            throw new Error(`Um erro ocorreu ao remover o serviço '${nomeServico}' do docker-compose.yml: ${error.message}`);
        }
    }

    static listarServicos(): Array<{ nome: string, porta: string[], imagem: string, replicas?: number, memory?: string }> {
        const filePath: string = path.resolve(process.cwd(), configPath);
        
        try {
            const composeFile = DockerClass.carregarYaml(filePath);
            const servicos: Array<{ nome: string, porta: string[], imagem: string, replicas?: number, memory?: string }> = [];
            
            // Percorre os serviços e transforma em JSON
            for (const [nomeServico, dadosServico] of Object.entries(composeFile.services)) {
                servicos.push({
                    nome: nomeServico,
                    porta: dadosServico.ports || [],
                    imagem: dadosServico.image,
                    replicas: dadosServico.deploy?.replicas,
                    memory: dadosServico.deploy?.resources?.limits?.memory
                });
            }
            
            return servicos;
        } catch (error: any) {
            throw new Error(`Erro ao listar serviços do docker-compose.yml: ${error.message}`);
        }
    }

    private static carregarYaml(filePath: string) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents) as DockerCompose;
    }

    private static salvarYaml(filePath: string, data: DockerCompose) {
        const newYaml = yaml.dump(data, { lineWidth: -1 });
        fs.writeFileSync(filePath, newYaml, 'utf8');
    }
}

// Interface do Docker Compose
export interface DockerCompose {
    version: string;
    services: {
        [key: string]: {
            image: string;
            deploy?: {
                replicas: number;
                update_config?: { parallelism: number; delay: string };
                resources?: { limits: { memory: string } };
            };
            ports?: string[];
            environment?: string[];
        };
    };
}