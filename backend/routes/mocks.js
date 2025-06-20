const express = require('express');
const { readIndex, writeIndex, deleteFile, ENDPOINTS_DIR, INDEX_FILE } = require('../utils/fileUtils');

const router = express.Router();

// Endpoint para criar um mock
router.post('/', async (req, res) => {
  const { method, path: endpointPath, responseStatus, responseHeaders, responseBody } = req.body;

  // Validação básica
  if (!method || !endpointPath || !responseStatus || !responseBody) {
    return res.status(400).json({ error: 'Campos obrigatórios: method, path, responseStatus, responseBody' });
  }

  // Validação do método HTTP
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const upperMethod = method.toUpperCase();
  if (!validMethods.includes(upperMethod)) {
    return res.status(400).json({ error: 'Método HTTP inválido. Use: GET, POST, PUT, DELETE, PATCH' });
  }

  // Criar objeto do mock
  const mock = {
    method: upperMethod,
    path: endpointPath,
    responseStatus,
    responseHeaders: responseHeaders || { 'Content-Type': 'application/json' },
    responseBody
  };

  // Gerar nome do arquivo baseado no método e caminho
  const cleanPath = endpointPath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  const fileName = `${upperMethod}_${cleanPath}_${Date.now()}.json`;
  const filePath = require('path').join(ENDPOINTS_DIR, fileName);

  // Chave para o índice
  const indexKey = `${upperMethod}_${endpointPath}`;

  try {
    // Salvar mock como arquivo JSON
    await require('fs').promises.writeFile(filePath, JSON.stringify(mock, null, 2));

    // Atualizar arquivo de índice
    const indexData = await readIndex(INDEX_FILE);
    indexData[indexKey] = filePath;
    await writeIndex(INDEX_FILE, indexData);

    res.status(201).json(mock);
  } catch (error) {
    // Remover arquivo criado em caso de erro
    await deleteFile(filePath);
    res.status(500).json({ error: 'Erro ao salvar o mock: ' + error.message });
  }
});

// Endpoint para listar todos os mocks
router.get('/', async (req, res) => {
  try {
    const indexData = await readIndex(INDEX_FILE);
    const mockList = Object.keys(indexData);
    res.status(200).json(mockList);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os mocks: ' + error.message });
  }
});

// Endpoint para deletar um mock específico
router.delete('/:path', async (req, res) => {
  const indexKey = decodeURIComponent(req.params.path);

  try {
    const indexData = await readIndex(INDEX_FILE);
    const filePath = indexData[indexKey];
    if (!filePath) {
      return res.status(404).json({ error: 'Endpoint não encontrado' });
    }

    await deleteFile(filePath);
    delete indexData[indexKey];
    await writeIndex(INDEX_FILE, indexData);

    res.status(200).json({ message: `Mock ${indexKey} deletado com sucesso` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o mock: ' + error.message });
  }
});

// Endpoint para deletar todos os mocks
router.delete('/', async (req, res) => {
  try {
    const indexData = await readIndex(INDEX_FILE);
    for (const [indexKey, filePath] of Object.entries(indexData)) {
      try {
        await deleteFile(filePath);
        console.log(`Arquivo deletado: ${filePath}`);
      } catch (error) {
        console.warn(`Aviso: Não foi possível deletar o arquivo ${filePath}: ${error.message}`);
      }
    }

    const files = await require('fs').promises.readdir(ENDPOINTS_DIR);
    for (const file of files) {
      const filePath = require('path').join(ENDPOINTS_DIR, file);
      try {
        await deleteFile(filePath);
        console.log(`Arquivo órfão deletado: ${filePath}`);
      } catch (error) {
        console.warn(`Aviso: Não foi possível deletar o arquivo órfão ${filePath}: ${error.message}`);
      }
    }

    await writeIndex(INDEX_FILE, {});
    console.log('index.json redefinido para vazio');

    res.status(200).json({ message: 'Todos os mocks foram deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar todos os mocks: ' + error.message });
  }
});

// Função para a rota genérica
async function handleGenericRoute(req, res) {
  const indexKey = `${req.method}_${req.path}`;

  try {
    const indexData = await readIndex(INDEX_FILE);
    const filePath = indexData[indexKey];
    if (!filePath) {
      return res.status(404).json({ error: 'Endpoint não encontrado' });
    }

    const mock = JSON.parse(await require('fs').promises.readFile(filePath));
    res.status(mock.responseStatus)
       .set(mock.responseHeaders)
       .send(mock.responseBody);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar a requisição: ' + error.message });
  }
}

module.exports = router;
module.exports.handleGenericRoute = handleGenericRoute;