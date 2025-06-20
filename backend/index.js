const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initialize, writeLog } = require('./utils/fileUtils');
const { getLocalIp } = require('./utils/networkUtils');
const mockRoutes = require('./routes/mocks');
const templateRoutes = require('./routes/templates');
const { formatInTimeZone } = require('date-fns-tz');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON e habilitar CORS
app.use(cors());
app.use(bodyParser.json());

// Middleware de logging
app.use(async (req, res, next) => {
  const startTime = process.hrtime.bigint();

  // Normalizar IP
  const normalizeIp = (ip) => ip === '::1' ? '127.0.0.1' : ip;

  // Log da requisição recebida
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

  // Capturar a resposta
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
      // Se não for JSON válido, manter como está
    }

    // Log da resposta enviada
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

// Inicializar diretórios e arquivos de índice
initialize().then(() => {
  console.log('Diretórios e arquivos de índice inicializados');
}).catch((error) => {
  console.error('Erro ao inicializar:', error);
});

// Rotas
app.use('/mocks', mockRoutes);
app.use('/templates', templateRoutes);

// Rota básica de teste
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

// Rota genérica para capturar todas as requisições
app.all(/(.*)/, async (req, res) => {
  const { handleGenericRoute } = require('./routes/mocks');
  await handleGenericRoute(req, res);
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`Servidor rodando em http://${ip}:${PORT}`);
});