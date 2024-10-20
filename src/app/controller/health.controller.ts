import { Request, Response } from 'express';
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
  
      const lines = stdout.split('\n');
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
    exec('df -h /', (error, stdout, stderr) => {
      if (error || stderr) {
        return res.status(500).json({ error: 'Failed to execute df command' });
      }
  
      const lines = stdout.split('\n');
      const diskData = lines[1].split(/\s+/);

      // Remove o sufixo 'G' e converte para float
      const sizeGB = parseFloat(diskData[1].replace('G', ''));
      const usedGB = parseFloat(diskData[2].replace('G', ''));
      const availableGB = parseFloat(diskData[3].replace('G', ''));

      const diskInfo = {
        total: sizeGB,
        used: usedGB,
        available: availableGB,
        unit: 'GB'
      };
  
      res.status(200).json({ diskInfo });
    });
  },
  getPublicIP() {
    exec('dig +short myip.opendns.com @resolver1.opendns.com', (error, stdout, stderr) => {
      if (error) {
        console.log(`Erro ao obter IP público: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`Erro: ${stderr}`);
        return;
      }
      process.env.IPADDRESS = stdout.trim();
  });
  }
}