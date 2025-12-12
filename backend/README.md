# Study Planner Backend

Backend da aplicação Study Planner Pro desenvolvido com Java e Spring Boot.

## Tecnologias Utilizadas

- Java 25
- Spring Boot 3.5.0
- Spring Web
- Spring Data JPA
- Spring Security
- H2 Database (em memória)
- Lombok
- Maven

## Estrutura do Projeto

```
backend/
├── src/main/java/com/studyplanner/backend/
│   ├── config/          # Configurações (Security, CORS)
│   ├── controller/      # Controllers REST
│   ├── dto/             # Data Transfer Objects
│   ├── model/           # Entidades JPA
│   ├── repository/      # Repositórios JPA
│   ├── service/         # Lógica de negócio
│   └── StudyPlannerBackendApplication.java
└── src/main/resources/
    └── application.properties
```

## Modelos de Dados

### User
- id (Long)
- name (String)
- email (String, único)
- password (String, criptografado)
- createdAt (LocalDateTime)

### Subject
- id (Long)
- userId (Long)
- name (String)
- color (String)
- createdAt (LocalDateTime)

### StudySession
- id (Long)
- userId (Long)
- subject (String)
- duration (Integer, em minutos)
- date (LocalDate)
- description (String)
- createdAt (LocalDateTime)

### Goal
- id (Long)
- userId (Long)
- title (String)
- description (String)
- targetHours (Integer)
- currentHours (Integer)
- deadline (LocalDate)
- active (Boolean)
- createdAt (LocalDateTime)

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Dashboard
- `GET /api/dashboard/stats/{userId}` - Obter estatísticas do usuário

### Sessões de Estudo
- `GET /api/study-sessions/user/{userId}` - Listar todas as sessões
- `GET /api/study-sessions/user/{userId}/recent` - Listar sessões recentes (últimos 7 dias)
- `POST /api/study-sessions` - Criar nova sessão
- `DELETE /api/study-sessions/{id}` - Deletar sessão

### Metas
- `GET /api/goals/user/{userId}` - Listar metas ativas
- `POST /api/goals` - Criar nova meta
- `PUT /api/goals/{id}` - Atualizar meta
- `DELETE /api/goals/{id}` - Deletar meta

### Matérias
- `GET /api/subjects/user/{userId}` - Listar matérias do usuário
- `POST /api/subjects` - Criar nova matéria
- `DELETE /api/subjects/{id}` - Deletar matéria

## Como Executar

### Pré-requisitos
- Java 11 ou superior
- Maven 3.6+

### Executar a aplicação

```bash
# Navegar até o diretório do backend
cd backend

# Executar com Maven
./mvnw spring-boot:run

# Ou compilar e executar o JAR
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

A aplicação estará disponível em: `http://localhost:8080`

### Console H2

O console do banco de dados H2 está disponível em: `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:studyplanner`
- Username: `sa`
- Password: (deixar em branco)

## Configuração CORS

O backend está configurado para aceitar requisições de:
- `http://localhost:3000` (React padrão)
- `http://localhost:5173` (Vite)

## Segurança

- Senhas são criptografadas usando BCrypt
- CSRF desabilitado para facilitar desenvolvimento
- CORS configurado para desenvolvimento local
- Endpoints de autenticação são públicos
- Demais endpoints estão abertos (sem autenticação JWT por enquanto)

## Banco de Dados

O projeto usa H2 Database em memória para desenvolvimento. Os dados são perdidos quando a aplicação é encerrada.

Para implementar persistência:
1. Alterar `spring.jpa.hibernate.ddl-auto` para `update`
2. Configurar um banco de dados persistente (PostgreSQL, MySQL, etc.)
3. Atualizar as dependências no `pom.xml`
