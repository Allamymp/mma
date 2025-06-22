// api_mock/routes/index.js

const API_CONTROL_PREFIX = '/__mma_controlEndpoint_45f7e5d2-b124-4c11-a2b3-8feaaaf4e190';

const ENDPOINTS = {
    // Rotas de gerenciamento de Mocks
    mocks: {
        base: `${API_CONTROL_PREFIX}/mocks`,
        list: `${API_CONTROL_PREFIX}/mocks`, // GET para listar todas as chaves de mocks
        details: `${API_CONTROL_PREFIX}/mocks/details/:mockKey`, // GET para obter detalhes de um mock específico
        create: `${API_CONTROL_PREFIX}/mocks`, // POST para criar um mock
        deleteSingle: `${API_CONTROL_PREFIX}/mocks/:path`, // DELETE para deletar um mock específico
        deleteAll: `${API_CONTROL_PREFIX}/mocks`, // DELETE para deletar todos os mocks
    },
    // Rotas de gerenciamento de Templates
    templates: {
        base: `${API_CONTROL_PREFIX}/templates`,
        list: `${API_CONTROL_PREFIX}/templates`, // GET para listar todos os nomes de templates
        details: `${API_CONTROL_PREFIX}/templates/:name`, // GET para obter detalhes de um template específico
        create: `${API_CONTROL_PREFIX}/templates`, // POST para criar um template
        deleteSingle: `${API_CONTROL_PREFIX}/templates/:name`, // DELETE para deletar um template específico
        deleteAll: `${API_CONTROL_PREFIX}/templates`, // DELETE para deletar todos os templates
    },
    ping: '/ping', // Rota de teste de conectividade
};

const BLOCKED_PATHS = [
    ENDPOINTS.ping,

    // Mocks
    ENDPOINTS.mocks.base,
    ENDPOINTS.mocks.list,
    ENDPOINTS.mocks.details.split('/:mockKey')[0],
    ENDPOINTS.mocks.create,
    ENDPOINTS.mocks.deleteSingle.split('/:path')[0],
    ENDPOINTS.mocks.deleteAll,

    // Templates
    ENDPOINTS.templates.base,
    ENDPOINTS.templates.list,
    ENDPOINTS.templates.details.split('/:name')[0],
    ENDPOINTS.templates.create,
    ENDPOINTS.templates.deleteSingle.split('/:name')[0],
    ENDPOINTS.templates.deleteAll,
];

module.exports = {
    API_CONTROL_PREFIX,
    ENDPOINTS,
    BLOCKED_PATHS,
};
