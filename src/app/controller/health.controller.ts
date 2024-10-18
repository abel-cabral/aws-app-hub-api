import { Request, Response } from "express";
import * as diskusage from 'diskusage';
import * as path from 'path';
import { exec } from 'child_process';

export const healthController = {
  checkhealth(req: Request, res: Response) {
    return res.status(200).json({ message: 'API Online' });
  },
  checkMemory(req: Request, res: Response) {
    exec('free -h', (error, stdout, stderr) => {
      if (error || stderr) {
        return res.status(500).json({ error: 'Failed to execute free command' });
      }
  
      // Dividir a saída em linhas
      const lines = stdout.split('\n');
  
      // Pegar os valores da segunda linha que contém os dados
      const memoryData = lines[1].split(/\s+/);
  
      const memoryInfo = {
        total: memoryData[1],
        used: memoryData[2],
        free: memoryData[3],
        shared: memoryData[4],
        buffCache: memoryData[5],
        available: memoryData[6]
      };
  
      res.status(200).json({ memoryInfo });
    });
  },
  checkDisk(req: Request, res: Response) {
    try {
      // Caminho para verificar o disco. Use "/" no Linux/Mac e "C:\\" no Windows
      const diskPath = path.resolve('/'); // ou "C:\\" no Windows
  
      // Obter informações sobre o uso do disco
      const { available, free, total } = diskusage.checkSync(diskPath);
  
      // Converter os valores para GB
      const totalGB = (total / (1024 ** 3)).toFixed(2); // Total em GB
      const freeGB = (free / (1024 ** 3)).toFixed(2); // Espaço livre em GB
      const usedGB = ((total - free) / (1024 ** 3)).toFixed(2); // Espaço ocupado em GB
  
      // Retornar os valores em JSON
      res.json({
        total: parseFloat(totalGB),
        free: parseFloat(freeGB),
        used: parseFloat(usedGB),
        unit: 'GB'
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter informações do disco.' });
    }
  }
}
