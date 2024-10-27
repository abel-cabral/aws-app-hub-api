import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function downloadFile(fileUrl: string, destination: string) {
    try {
        // Faz a requisição para baixar o arquivo
        const response = await axios.get(fileUrl, { responseType: 'stream' });

        // Extrai o diretório do caminho do destino
        const directory = path.dirname(destination);

        // Verifica se o diretório existe, se não, cria o diretório
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        // Cria um stream de escrita para salvar o arquivo no sistema local
        const fullSavePath = path.resolve(destination);
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

export const downloadFileFromGitHub = downloadFile;