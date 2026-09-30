# Arquitetura de Microsserviços

O StudyPlanner evoluiu para uma arquitetura incremental: o domínio existente continua no
`backend/` (agora **study-core-service**) e os serviços transversais foram separados. Isso
evita reescrever funcionalidades prontas e mantém uma migração realista.

```text
React → API Gateway :8080 → study-core-service :8081 → PostgreSQL
                  ↘                 │
                    Eureka :8761    └─ evento study.session.created → RabbitMQ → notification-service :8082
```

## Serviços

| Serviço | Responsabilidade | Porta |
|---|---|---:|
| `service-discovery` | Registro e descoberta com Eureka | 8761 |
| `api-gateway` | Ponto único de entrada e roteamento com load balancing | 8080 |
| `study-core-service` | Usuários, matérias, sessões, metas e dashboard | 8081 (interna 8080) |
| `notification-service` | Consome eventos de estudo; limite para e-mail/push futuro | 8082 |
| RabbitMQ | Broker de eventos, com fila durável | 5672 / 15672 |

## Fluxo assíncrono

Ao criar uma sessão, o serviço central persiste os dados e publica o contrato
`study.session.created` no exchange `study.events`. O serviço de notificações consome a
mensagem pela fila durável `notification.study-session-created`. Não há senha, JWT ou outro
dado sensível no evento.

O publisher é desligado por padrão (`MESSAGING_ENABLED=false`), permitindo que o backend
continue simples em desenvolvimento. No `docker compose`, ele é ativado.

## Execução

1. Crie um arquivo `.env` na raiz com as variáveis já usadas pelo projeto (`POSTGRES_*`,
   `DB_HOST`, `DB_PORT`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`). Para Docker, use
   `DB_HOST=db` e `DB_PORT=5432`.
2. Execute `docker compose up --build`.
3. A API passa a ser acessada por `http://localhost:8080/api/...`.
4. Consulte `http://localhost:8761` (Eureka), `http://localhost:15672` (RabbitMQ; guest/guest)
   e `/actuator/health` em cada serviço para verificar a saúde.

## Competências demonstradas

- Java 21, Spring Boot, REST, JPA, PostgreSQL e Spring Security.
- Spring Cloud: Eureka, API Gateway e client-side load balancing.
- Mensageria orientada a eventos com RabbitMQ e contratos explícitos.
- Health checks, métricas Prometheus e imagens Docker por serviço.
- Testes unitários e de controller no serviço de domínio, com CI em GitHub Actions.

Próximos incrementos naturais: banco próprio por serviço, autenticação validada no gateway,
DLQ/retry para eventos e tracing distribuído com OpenTelemetry.
