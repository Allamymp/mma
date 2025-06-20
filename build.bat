@echo off
REM --- Script para Build e Início da Aplicação (Windows) ---

REM --- Variáveis de Configuração ---
SET FRONTEND_DIR=frontend
SET BACKEND_DIR=backend
SET NODE_PORT=3000

echo.
echo --- Iniciando o processo de Build e Configuração ---
echo.

REM --- 1. Build do Frontend Angular ---
echo ^^> Construindo o Frontend Angular...
IF NOT EXIST "%FRONTEND_DIR%" (
    echo Erro: A pasta %FRONTEND_DIR% nao foi encontrada. Certifique-se de que o script esta na pasta mae.
    exit /b 1
)
cd "%FRONTEND_DIR%" || (echo Erro: Nao foi possivel entrar na pasta %FRONTEND_DIR% & exit /b 1)
echo Instalando dependencias do Frontend...
call npm install || (echo Erro: Falha ao instalar dependencias do Frontend & exit /b 1)
echo Gerando build de producao do Frontend...
call ng build -c production || (echo Erro: Falha ao gerar build de producao do Frontend & exit /b 1)
echo Frontend Angular construido com sucesso!
cd .. || (echo Erro: Nao foi possivel voltar para a pasta pai & exit /b 1)

echo.

REM --- 2. Configuracao e Instalacao de Dependencias do Backend Node.js ---
echo ^^> Preparando o Backend Node.js...
IF NOT EXIST "%BACKEND_DIR%" (
    echo Erro: A pasta %BACKEND_DIR% nao foi encontrada. Certifique-se de que o script esta na pasta mae.
    exit /b 1
)
cd "%BACKEND_DIR%" || (echo Erro: Nao foi possivel entrar na pasta %BACKEND_DIR% & exit /b 1)
echo Instalando dependencias do Backend...
call npm install || (echo Erro: Falha ao instalar dependencias do Backend & exit /b 1)
echo Backend Node.js configurado com sucesso!

REM --- 3. Iniciando o Servidor Node.js no Foreground ---
echo.
echo ^^> Iniciando o servidor Node.js no foreground (na porta %NODE_PORT%)...
echo Pressione Ctrl+C para encerrar o servidor.
call npm start

REM O script nao chegara a este ponto enquanto o servidor estiver rodando.
REM Ele so continuara se o servidor for encerrado ou falhar ao iniciar.
echo Servidor Node.js encerrado ou falhou ao iniciar.

cd .. || (echo Erro: Nao foi possivel voltar para a pasta pai & exit /b 1)

echo.
echo --- Processo Concluido! ---
echo A aplicacao completa (Frontend + API) deve estar disponivel em http://localhost:%NODE_PORT%
echo Aguarde alguns segundos para o servidor iniciar completamente.

exit /b 0