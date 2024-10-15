import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

class GitHubService {
    // Método para baixar e salvar um arquivo do GitHub
    async downloadFileFromGitHub(fileUrl: string) {
        try {
            // Faz a requisição para baixar o arquivo
            const response = await axios.get(fileUrl, { responseType: 'stream' });

            // Cria um stream de escrita para salvar o arquivo no sistema local
            const fullSavePath = path.resolve('docker-compose.yml');
            const writer = fs.createWriteStream(fullSavePath);

            // Conecta o stream de leitura da resposta com o stream de escrita
            response.data.pipe(writer);

            // Retorna uma Promise para garantir que o arquivo foi escrito corretamente
            return new Promise<void>((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error: any) {
            console.error(`Erro ao baixar o arquivo: ${error?.message}`);
            throw new Error('Falha no download do arquivo');
        }
    }
}

export const gitHubService = new GitHubService();