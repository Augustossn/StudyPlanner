# Study Planner Pro 🚀

[![Frontend](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Java-11-orange?logo=java)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.7.18-green?logo=spring)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-Apache%202-blue)](LICENSE)

Aplicación completa de planificación de estudios con **frontend en React + Tailwind CSS** y **backend en Java + Spring Boot**.

## Estrutura do Projeto

```
study-planner/
├── backend/          # API REST em Java + Spring Boot
└── frontend/         # Interface em React + Tailwind CSS
```

## Tecnologias

### Backend
- Java 11
- Spring Boot 2.7.18
- Spring Web
- Spring Data JPA
- Spring Security
- H2 Database (em memória)
- Lombok
- Maven

### Frontend
- React 19.2
- Vite 7.2.4
- Tailwind CSS 4.1.17
- React Router DOM
- Axios
- Recharts
- Lucide React

## Como Executar

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

O frontend estará disponível em: `http://localhost:5173`

## Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ Dashboard com estatísticas
- ✅ Gráfico de horas de estudo
- ✅ Sessões de estudo recentes
- ✅ Metas ativas com progresso
- ✅ Gerenciamento de matérias
- ✅ API REST completa
- ✅ Design responsivo e tema escuro

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login

### Dashboard
- `GET /api/dashboard/stats/{userId}` - Estatísticas do usuário

### Sessões de Estudo
- `GET /api/study-sessions/user/{userId}` - Listar sessões
- `GET /api/study-sessions/user/{userId}/recent` - Sessões recentes
- `POST /api/study-sessions` - Criar sessão
- `DELETE /api/study-sessions/{id}` - Deletar sessão

### Metas
- `GET /api/goals/user/{userId}` - Listar metas
- `POST /api/goals` - Criar meta
- `PUT /api/goals/{id}` - Atualizar meta
- `DELETE /api/goals/{id}` - Deletar meta

### Matérias
- `GET /api/subjects/user/{userId}` - Listar matérias
- `POST /api/subjects` - Criar matéria
- `DELETE /api/subjects/{id}` - Deletar matéria

## Banco de Dados

O projeto usa H2 Database em memória para desenvolvimento. Para implementar persistência, configure um banco de dados como PostgreSQL ou MySQL no `application.properties`.

Console H2: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:studyplanner`
- Username: `sa`
- Password: (vazio)

## Próximos Passos

Para implementar o banco de dados persistente:

1. Adicionar dependência do PostgreSQL/MySQL no `pom.xml`
2. Atualizar `application.properties` com configurações do banco
3. Alterar `spring.jpa.hibernate.ddl-auto` para `update`
4. Executar migrations se necessário
