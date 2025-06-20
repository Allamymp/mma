#!/bin/bash

# --- Variáveis de Configuração ---
FRONTEND_DIR="frontend"
BACKEND_DIR="api_mock"
NODE_PORT="3000" # A porta que seu servidor Node.js usa

# --- Mensagens Coloridas ---
GREEN='\033[0;32m'
YELLOW='\033;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}--- Iniciando o processo de Build e Configuração ---${NC}"

# --- 1. Build do Frontend Angular ---
echo -e "${YELLOW}>> Construindo o Frontend Angular...${NC}"
if [ -d "$FRONTEND_DIR" ]; then # Verifica se a pasta frontend existe
    cd "$FRONTEND_DIR" || { echo "Erro: Não foi possível entrar na pasta $FRONTEND_DIR"; exit 1; }
    echo "Instalando dependências do Frontend..."
    npm install || { echo "Erro: Falha ao instalar dependências do Frontend"; exit 1; }
    echo "Gerando build de produção do Frontend..."
    ng build -c production || { echo "Erro: Falha ao gerar build de produção do Frontend"; exit 1; }
    echo -e "${GREEN}Frontend Angular construído com sucesso!${NC}"
    cd .. || { echo "Erro: Não foi possível voltar para a pasta pai"; exit 1; }
else
    echo -e "${RED}Erro: A pasta $FRONTEND_DIR não foi encontrada. Certifique-se de que o script está na pasta mãe.${NC}"
    exit 1
fi

# --- 2. Configuração e Instalação de Dependências do Backend Node.js ---
echo -e "${YELLOW}>> Preparando o Backend Node.js...${NC}"
if [ -d "$BACKEND_DIR" ]; then # Verifica se a pasta backend existe
    cd "$BACKEND_DIR" || { echo "Erro: Não foi possível entrar na pasta $BACKEND_DIR"; exit 1; }
    echo "Instalando dependências do Backend..."
    npm install || { echo "Erro: Falha ao instalar dependências do Backend"; exit 1; }
    echo -e "${GREEN}Backend Node.js configurado com sucesso!${NC}"

    # --- 3. Iniciando o Servidor Node.js no Foreground ---
    echo -e "${YELLOW}>> Iniciando o servidor Node.js no foreground (na porta ${NODE_PORT})...${NC}"
    echo -e "${YELLOW}Pressione Ctrl+C para encerrar o servidor.${NC}"
    npm start # <<-- SEM "& disown"

    # O script não chegará a este ponto enquanto o servidor estiver rodando.
    # Ele só continuará se o servidor for encerrado ou falhar ao iniciar.
    echo -e "${GREEN}Servidor Node.js encerrado ou falhou ao iniciar.${NC}"

    cd .. || { echo "Erro: Não foi possível voltar para a pasta pai"; exit 1; }
else
    echo -e "${RED}Erro: A pasta $BACKEND_DIR não foi encontrada. Certifique-se de que o script está na pasta mãe.${NC}"
    exit 1
fi

echo -e "${GREEN}--- Processo Concluído! ---${NC}"
echo -e "${GREEN}A aplicação completa (Frontend + API) deve estar disponível em http://localhost:${NODE_PORT}${NC}"
echo -e "${GREEN}Aguarde alguns segundos para o servidor iniciar completamente.${NC}"

exit 0