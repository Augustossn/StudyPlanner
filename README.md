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

## 🛠 Tecnologías

### Backend
- **Java 11**
- **Spring Boot 2.7**  
- **Spring Web** (para crear la API REST)  
- **Spring Data JPA** (para acceso a la base de datos)  
- **Spring Security** (autenticación y autorización)  
- **H2 Database** (en memoria para desarrollo)  
- **Lombok** (reducción de boilerplate)  
- **Maven** (gestión de dependencias y build)

### Frontend
- **React 19.2** (librería para la interfaz de usuario)  
- **Vite 7.2** (bundler rápido para desarrollo)  
- **Tailwind CSS 4.1** (framework CSS para diseño responsivo)  
- **React Router DOM** (navegación entre páginas)  
- **Axios** (peticiones HTTP a la API)  
- **Recharts** (gráficos y estadísticas)  
- **Lucide React** (iconos modernos)


## ⚡ Instalación Rápida

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend disponible en: http://localhost:8080
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# Frontend disponible en: http://localhost:5173
```

O frontend estará disponível em: `http://localhost:5173`

## 🎯 Funcionalidades

- ✅ Autenticación (Login / Registro)  
- ✅ Dashboard con estadísticas  
- ✅ Gráficos de horas de estudio  
- ✅ Sesiones de estudio recientes  
- ✅ Metas activas con progreso  
- ✅ Gestión de materias  
- ✅ API REST completa  
- ✅ Diseño responsivo y tema oscuro  

![Dashboard Screenshot](./frontend/src/assets/dashboard.png)  
*Ejemplo de Dashboard de Study Planner Pro*


## 🔗 Endpoints de la API

| Funcionalidad          | Endpoint                                 | Método |
|------------------------|-----------------------------------------|--------|
| Registrar usuario       | /api/auth/register                       | POST   |
| Iniciar sesión          | /api/auth/login                          | POST   |
| Estadísticas del usuario| /api/dashboard/stats/{userId}           | GET    |
| Listar sesiones         | /api/study-sessions/user/{userId}       | GET    |
| Listar sesiones recientes| /api/study-sessions/user/{userId}/recent| GET    |
| Crear sesión            | /api/study-sessions                     | POST   |
| Eliminar sesión         | /api/study-sessions/{id}                | DELETE |
| Listar metas            | /api/goals/user/{userId}                | GET    |
| Crear meta              | /api/goals                              | POST   |
| Actualizar meta         | /api/goals/{id}                         | PUT    |
| Eliminar meta           | /api/goals/{id}                         | DELETE |
| Listar materias         | /api/subjects/user/{userId}             | GET    |
| Crear materia           | /api/subjects                           | POST   |
| Eliminar materia        | /api/subjects/{id}                      | DELETE |


## 🗄 Base de Datos

- **H2 Database** en memoria (para desarrollo)  
- Console H2: `http://localhost:8080/h2-console`  
- JDBC URL: `jdbc:h2:mem:studyplanner`  
- Usuario: `sa`  
- Contraseña: (vacío)  

> Para usar un **banco de datos persistente** (PostgreSQL / MySQL), configure `application.properties` y cambie `spring.jpa.hibernate.ddl-auto` a `update`.


## 🤝 Contribuciones

1. Hacer fork del repositorio  
2. Crear una rama de función: `feature/mi-funcion`  
3. Hacer commit de los cambios  
4. Abrir un Pull Request

## 🚀 Próximos Pasos

- Implementar base de datos persistente  
- Mejorar tests  
- Añadir más estadísticas y gráficos

### 📸 Capturas de Pantalla

![Pantalla de Inicio](./frontend/src/assets/home.png)  
*Vista de la pantalla principal de Study Planner Pro*

![Vista de Sesiones](./frontend/src/assets/sessions.png)  
*Listado de sesiones de estudio recientes*

![Vista de Metas](./frontend/src/assets/goals.png)  
*Seguimiento de metas activas con progreso*
