# Como Executar o Study Planner Pro

## Pré-requisitos

- Java 11 ou superior
- Maven 3.6+ (ou usar o wrapper incluído)
- Node.js 18+ ou pnpm

## Passo a Passo

### 1. Iniciar o Backend

Abra um terminal e execute:

```bash
cd backend
./mvnw spring-boot:run
```

Aguarde até ver a mensagem: "Started StudyPlannerBackendApplication"

O backend estará rodando em: **http://localhost:8080**

### 2. Iniciar o Frontend

Abra outro terminal e execute:

```bash
cd frontend
pnpm install  # apenas na primeira vez
pnpm dev
```

O frontend estará rodando em: **http://localhost:5173**

### 3. Acessar a Aplicação

Abra seu navegador e acesse: **http://localhost:5173**

## Testando a Aplicação

1. **Criar uma conta:**
   - Clique em "Criar Conta"
   - Preencha: Nome, Email e Senha
   - Clique em "Criar Conta"

2. **Fazer login:**
   - Use o email e senha cadastrados
   - Clique em "Entrar"

3. **Explorar o Dashboard:**
   - Veja as estatísticas (inicialmente zeradas)
   - Explore os gráficos e seções
   - Os botões de ação já estão implementados visualmente

## Banco de Dados

O banco de dados é **em memória** (H2). Os dados são perdidos quando o backend é encerrado.

Para acessar o console do H2:
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:studyplanner`
- Username: `sa`
- Password: (deixar em branco)

## Parar a Aplicação

- **Backend**: Pressione `Ctrl+C` no terminal do backend
- **Frontend**: Pressione `Ctrl+C` no terminal do frontend

## Problemas Comuns

### Porta já em uso

Se a porta 8080 ou 5173 já estiver em uso:

**Backend (8080):**
- Edite `backend/src/main/resources/application.properties`
- Altere: `server.port=8081` (ou outra porta)

**Frontend (5173):**
- Edite `frontend/vite.config.js`
- Adicione configuração de porta

### Erro de conexão com API

Verifique se:
1. O backend está rodando (http://localhost:8080)
2. O frontend está configurado para a URL correta em `frontend/src/services/api.js`
