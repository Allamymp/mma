const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');

const LOG_DIR = path.join(__dirname, '..', 'requisitions', 'log');
const ENDPOINTS_DIR = path.join(__dirname, '..', 'requisitions', 'mocks');
const TEMPLATES_DIR = path.join(__dirname, '..', 'requisitions', 'templates');
const INDEX_FILE = path.join(ENDPOINTS_DIR, 'index.json');

async function initialize() {
    try {
        // Criar diretórios
        await fs.mkdir(LOG_DIR, { recursive: true });
        await fs.mkdir(ENDPOINTS_DIR, { recursive: true });
        await fs.mkdir(TEMPLATES_DIR, { recursive: true });

        // Verificar permissões de escrita em LOG_DIR
        const testFile = path.join(LOG_DIR, 'test.txt');
        try {
            await fs.writeFile(testFile, '');
            await fs.unlink(testFile);
        } catch (error) {
            throw new Error(`Sem permissão de escrita em ${LOG_DIR}: ${error.message}`);
        }

        // Inicializar index.json
        try {
            await fs.access(INDEX_FILE);
        } catch {
            await fs.writeFile(INDEX_FILE, JSON.stringify({}));
        }
    } catch (error) {
        throw new Error(`Erro ao inicializar diretórios: ${error.message}`);
    }
}

async function writeLog(logEntry) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const logFile = path.join(LOG_DIR, `log_${year}-${month}-${day}.json`);

    // Garantir que o diretório existe
    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
    } catch (error) {
        console.error(`Erro ao criar diretório de log ${LOG_DIR}: ${error.message}`);
        throw error;
    }

    // Verificar e criar arquivo de log se não existir
    try {
        await fs.access(logFile);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Criando novo arquivo de log: ${logFile}`);
            await fs.writeFile(logFile, JSON.stringify([], null, 2));
        } else {
            console.error(`Erro ao verificar arquivo de log ${logFile}: ${error.message}`);
            throw error;
        }
    }

    let logs = [];
    try {
        // Ler arquivo existente
        const data = await fs.readFile(logFile, 'utf8');
        if (data.trim()) {
            logs = JSON.parse(data);
            if (!Array.isArray(logs)) {
                console.warn(`Arquivo de log ${logFile} corrompido. Inicializando novo log.`);
                logs = [];
            }
        }

        logs.push(logEntry);

        // Usar lock para evitar escritas concorrentes
        const release = await lockfile.lock(logFile, { retries: 5 });
        try {
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } finally {
            await release();
        }
    } catch (error) {
        console.error(`Erro ao escrever log em ${logFile}: ${error.message}`);
        throw error;
    }
}

async function readIndex(indexFile = INDEX_FILE) {
    try {
        const data = await fs.readFile(indexFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw new Error(`Erro ao ler index.json: ${error.message}`);
    }
}

async function writeIndex(indexFile = INDEX_FILE, data) {
    try {
        await fs.writeFile(indexFile, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error(`Erro ao escrever index.json: ${error.message}`);
    }
}

async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw new Error(`Erro ao deletar arquivo ${filePath}: ${error.message}`);
        }
    }
}

module.exports = {
    initialize,
    writeLog,
    readIndex,
    writeIndex,
    deleteFile,
    ENDPOINTS_DIR,
    TEMPLATES_DIR,
    INDEX_FILE
};