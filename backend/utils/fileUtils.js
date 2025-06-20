const fs = require('fs').promises;
const path = require('path');

// Diretórios
const REQUISITIONS_DIR = path.join(__dirname, '../requisitions');
const TEMPLATES_DIR = path.join(REQUISITIONS_DIR, 'templates');
const ENDPOINTS_DIR = path.join(REQUISITIONS_DIR, 'endpoints');
const LOG_DIR = path.join(REQUISITIONS_DIR, 'log');
const INDEX_FILE = path.join(REQUISITIONS_DIR, 'index.json');
const TEMPLATES_INDEX_FILE = path.join(REQUISITIONS_DIR, 'templates_index.json');

// Criar diretórios e arquivos de índice
async function initialize() {
  try {
    await fs.mkdir(REQUISITIONS_DIR, { recursive: true });
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    await fs.mkdir(ENDPOINTS_DIR, { recursive: true });
    await fs.mkdir(LOG_DIR, { recursive: true });

    try {
      await fs.access(INDEX_FILE);
    } catch {
      await fs.writeFile(INDEX_FILE, JSON.stringify({}, null, 2));
    }

    try {
      await fs.access(TEMPLATES_INDEX_FILE);
    } catch {
      await fs.writeFile(TEMPLATES_INDEX_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    throw new Error('Erro ao inicializar diretórios e arquivos: ' + error.message);
  }
}

// Ler arquivo de índice
async function readIndex(indexFile) {
  try {
    const data = await fs.readFile(indexFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Erro ao ler o arquivo de índice: ' + error.message);
  }
}

// Escrever arquivo de índice
async function writeIndex(indexFile, data) {
  try {
    await fs.writeFile(indexFile, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error('Erro ao escrever o arquivo de índice: ' + error.message);
  }
}

// Deletar um arquivo
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignorar erro se o arquivo não existe
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

// Escrever entrada de log no arquivo do dia
async function writeLog(logEntry) {
  try {
    // Limitar tamanho do corpo para evitar logs muito grandes
    const MAX_BODY_SIZE = 10240; // 10KB
    if (logEntry.body && typeof logEntry.body === 'object') {
      const bodyString = JSON.stringify(logEntry.body);
      if (bodyString.length > MAX_BODY_SIZE) {
        logEntry.body = { truncated: bodyString.substring(0, MAX_BODY_SIZE - 100) + '... [TRUNCATED]' };
      }
    }

    // Obter o arquivo de log do dia atual
    const today = new Date().toISOString().split('T')[0]; // Ex.: 2025-06-20
    const logFile = path.join(LOG_DIR, `log_${today}.json`);

    // Ler o arquivo existente ou criar um novo
    let logs = [];
    try {
      const data = await fs.readFile(logFile, 'utf8');
      if (data.trim() === '') {
        // Arquivo vazio, inicializar com array vazio
        logs = [];
      } else {
        logs = JSON.parse(data);
        if (!Array.isArray(logs)) {
          // Arquivo não contém um array, reinicializar
          logs = [];
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
        // Arquivo não existe ou está corrompido, criar novo
        logs = [];
      } else {
        throw error;
      }
    }

    // Adicionar a nova entrada
    logs.push(logEntry);

    // Escrever de volta no arquivo
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Erro ao escrever log:', error.message);
  }
}

module.exports = {
  initialize,
  readIndex,
  writeIndex,
  deleteFile,
  writeLog,
  REQUISITIONS_DIR,
  TEMPLATES_DIR,
  ENDPOINTS_DIR,
  LOG_DIR,
  INDEX_FILE,
  TEMPLATES_INDEX_FILE
};