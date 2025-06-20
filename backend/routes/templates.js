const express = require('express');
const { readIndex, writeIndex, deleteFile, TEMPLATES_DIR, TEMPLATES_INDEX_FILE } = require('../utils/fileUtils');

const router = express.Router();

// Endpoint para criar um template
router.post('/', async (req, res) => {
  const { name, responseStatus, responseHeaders, responseBody } = req.body;

  // Validação básica
  if (!name || !responseStatus || !responseBody) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, responseStatus, responseBody' });
  }

  // Validar que name é uma string não vazia
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'O campo name deve ser uma string não vazia' });
  }

  // Criar objeto do template
  const template = {
    name: name.trim(),
    responseStatus,
    responseHeaders: responseHeaders || { 'Content-Type': 'application/json' },
    responseBody
  };

  // Gerar nome do arquivo baseado no name
  const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  const fileName = `${cleanName}_${Date.now()}.json`;
  const filePath = require('path').join(TEMPLATES_DIR, fileName);

  try {
    // Verificar se o template já existe
    const templatesIndex = await readIndex(TEMPLATES_INDEX_FILE);
    if (templatesIndex[name]) {
      return res.status(409).json({ error: `Template com nome ${name} já existe` });
    }

    // Salvar template como arquivo JSON
    await require('fs').promises.writeFile(filePath, JSON.stringify(template, null, 2));

    // Atualizar arquivo de índice de templates
    templatesIndex[name] = filePath;
    await writeIndex(TEMPLATES_INDEX_FILE, templatesIndex);

    res.status(201).json(template);
  } catch (error) {
    // Remover arquivo criado em caso de erro
    await deleteFile(filePath);
    res.status(500).json({ error: 'Erro ao salvar o template: ' + error.message });
  }
});

// Endpoint para listar todos os templates
router.get('/', async (req, res) => {
  try {
    const templatesIndex = await readIndex(TEMPLATES_INDEX_FILE);
    const templateList = Object.keys(templatesIndex);
    res.status(200).json(templateList);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os templates: ' + error.message });
  }
});

// Endpoint para recuperar um template específico
router.get('/:name', async (req, res) => {
  const templateName = decodeURIComponent(req.params.name);

  try {
    const templatesIndex = await readIndex(TEMPLATES_INDEX_FILE);
    const filePath = templatesIndex[templateName];
    if (!filePath) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    const template = JSON.parse(await require('fs').promises.readFile(filePath));
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao recuperar o template: ' + error.message });
  }
});

// Endpoint para deletar um template específico
router.delete('/:name', async (req, res) => {
  const templateName = decodeURIComponent(req.params.name);

  try {
    const templatesIndex = await readIndex(TEMPLATES_INDEX_FILE);
    const filePath = templatesIndex[templateName];
    if (!filePath) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    await deleteFile(filePath);
    delete templatesIndex[templateName];
    await writeIndex(TEMPLATES_INDEX_FILE, templatesIndex);

    res.status(200).json({ message: `Template ${templateName} deletado com sucesso` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o template: ' + error.message });
  }
});

// Endpoint para deletar todos os templates
router.delete('/', async (req, res) => {
  try {
    const templatesIndex = await readIndex(TEMPLATES_INDEX_FILE);
    for (const [templateName, filePath] of Object.entries(templatesIndex)) {
      try {
        await deleteFile(filePath);
        console.log(`Arquivo de template deletado: ${filePath}`);
      } catch (error) {
        console.warn(`Aviso: Não foi possível deletar o arquivo ${filePath}: ${error.message}`);
      }
    }

    const files = await require('fs').promises.readdir(TEMPLATES_DIR);
    for (const file of files) {
      const filePath = require('path').join(TEMPLATES_DIR, file);
      try {
        await deleteFile(filePath);
        console.log(`Arquivo órfão de template deletado: ${filePath}`);
      } catch (error) {
        console.warn(`Aviso: Não foi possível deletar o arquivo órfão ${filePath}: ${error.message}`);
      }
    }

    await writeIndex(TEMPLATES_INDEX_FILE, {});
    console.log('templates_index.json redefinido para vazio');

    res.status(200).json({ message: 'Todos os templates foram deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar todos os templates: ' + error.message });
  }
});

module.exports = router;