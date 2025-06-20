const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initialize, writeLog } = require('./utils/fileUtils');
const { getLocalIp } = require('./utils/networkUtils');
const mockRoutes = require('./routes/mocks');
const templateRoutes = require('./routes/templates');
const { formatInTimeZone } = require('date-fns-tz');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON e habilitar CORS
app.use(cors());
app.use(bodyParser.json());

// Middleware de logging
app.use(async (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const normalizeIp = (ip) => ip === '::1' ? '127.0.0.1' : ip;

    console.log(`Requisição recebida: ${req.method} ${req.originalUrl} (path: ${req.path})`);

    const requestLog = {
        type: 'request',
        timestamp: formatInTimeZone(new Date(), 'America/Recife', "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sourceIp: normalizeIp(req.ip) || 'unknown',
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
        body: req.body || null
    };

    try {
        await writeLog(requestLog);
    } catch (error) {
        console.error('Erro ao salvar log de requisição:', error.message);
    }

    const originalSend = res.send;
    res.send = async function (body) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number((endTime - startTime) / BigInt(1_000_000));

        let parsedBody = body;
        try {
            if (typeof body === 'string' && body.startsWith('{') && body.endsWith('}')) {
                parsedBody = JSON.parse(body);
            }
        } catch (error) {
            // Ignorar erros de parsing
        }

        const responseLog = {
            type: 'response',
            timestamp: formatInTimeZone(new Date(), 'America/Recife', "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
            destinationIp: normalizeIp(req.ip) || 'unknown',
            status: res.statusCode,
            headers: res.getHeaders(),
            body: parsedBody || null,
            durationMs
        };

        try {
            await writeLog(responseLog);
        } catch (error) {
            console.error('Erro ao salvar log de resposta:', error.message);
        }

        return originalSend.call(this, body);
    };

    next();
});

// Servir arquivos estáticos do Angular
const ANGULAR_DIST_PATH = path.join(__dirname, '..', 'frontend', 'dist', 'frontend','browser');
app.use(express.static(ANGULAR_DIST_PATH));

// Rotas da API
app.use('/mocks', mockRoutes);
app.use('/templates', templateRoutes);

// Rota básica de teste
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Hello World' });
});

// Servir index.html do Angular para rotas não-API
app.use((req, res, next) => {
    if (req.path.startsWith('/mocks') || req.path.startsWith('/templates') || req.path.startsWith('/ping')) {
        return next();
    }
    console.log(`Servindo index.html para: ${req.originalUrl}`);
    res.sendFile(path.join(ANGULAR_DIST_PATH, 'index.html'), (err) => {
        if (err) {
            console.error(`Erro ao servir index.html: ${err.message}`);
            res.status(500).json({ error: 'Erro ao carregar a aplicação' });
        }
    });
});

// Middleware para rotas genéricas (mocks dinâmicos)
const { handleGenericRoute } = require('./routes/mocks');
app.use((req, res, next) => {
    console.log(`Encaminhando para handleGenericRoute: ${req.method} ${req.path}`);
    handleGenericRoute(req, res, next);
});

// Iniciar o servidor
initialize().then(() => {
    console.log('Diretórios e arquivos de índice inicializados');
}).catch((error) => {
    console.error('Erro ao inicializar:', error);
});

app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIp();
    console.log(`Servidor Node.js (API + Frontend) rodando em http://${ip}:${PORT}`);
    console.log(`Acesse a aplicação em http://${ip}:${PORT}`);
});