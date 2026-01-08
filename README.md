# Study Planner Pro 🚀

[![Frontend](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Java-25-orange?logo=java)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.1-green?logo=spring)](https://spring.io/projects/spring-boot)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202-blue)](LICENSE)

A complete, full-stack **study planning application** designed to boost productivity. Built with a **React + Tailwind CSS frontend** and a **Java + Spring Boot backend**, it features a robust Pomodoro timer, detailed analytics, and a fully customizable user experience.

---

## 📂 Project Structure

```text
study-planner/
├── backend/   # REST API in Java + Spring Boot
└── frontend/  # Interface in React + Tailwind CSS
```

---

## 🛠 Technologies

### Backend

* **Java 21**
* **Spring Boot 3.5**
* **Spring Web** (REST API)
* **Spring Data JPA** (Database access)
* **Spring Security** (Authentication & JWT Authorization)
* **PostgreSQL** (Primary database)
* **H2 Database** (Optional for local testing)
* **Lombok** (Boilerplate reduction)
* **Maven** (Dependency management)

### Frontend

* **React 19.2** (UI Library)
* **Vite 7.2** (Build tool)
* **Tailwind CSS 4.1** (Styling with CSS Variables for theming)
* **Context API** (State management for themes)
* **React Router DOM** (Navigation)
* **Axios** (HTTP requests)
* **Recharts** (Analytics & charts)
* **Lucide React** (Icons)
* **React Hot Toast** (Notifications)

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

* Server runs at: **[http://localhost:8080](http://localhost:8080)**

### 2. Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

* App runs at: **[http://localhost:5173](http://localhost:5173)**

---

## 🎯 Key Features

### 🧠 Study Management

* **Dashboard**: Real-time overview of streaks, total hours, and session counts.
* **Analytics**: Visual charts for study time by subject and question performance.
* **Goal Tracking**: Weekly, monthly, and long-term goals with progress indicators.

### 🍅 Productivity Tools

* **Advanced & Configurable Pomodoro Timer**

  * Fully customizable durations:

    * Focus time
    * Short break
    * Long break
  * User-defined Pomodoro cycles before long breaks.
  * Accumulated study time logic across multiple cycles before persisting sessions.
  * Animated circular progress bar with smooth transitions.
  * Custom session titles editable directly from the timer.

### 🎨 Customization & UX

* **Dynamic Theming**: Light, Dark, and System modes.
* **Accessibility**: Adjustable font sizes (Small, Normal, Large).
* **Settings**: Password management, sound effects, and user preferences.
* **Responsive Design**: Fully optimized for desktop and mobile devices.

---

## 🔗 API Endpoints

### Authentication

| Endpoint                    | Method | Description          |
| --------------------------- | ------ | -------------------- |
| `/api/auth/register`        | POST   | Register a new user  |
| `/api/auth/login`           | POST   | Authenticate user    |
| `/api/auth/change-password` | POST   | Update user password |

### Dashboard

| Endpoint                        | Method | Description                     |
| ------------------------------- | ------ | ------------------------------- |
| `/api/dashboard/stats/{userId}` | GET    | Retrieve main stats and streaks |

### Study Sessions

| Endpoint                            | Method | Description                     |
| ----------------------------------- | ------ | ------------------------------- |
| `/api/study-sessions/user/{userId}` | GET    | List session history            |
| `/api/study-sessions`               | POST   | Save Pomodoro or manual session |
| `/api/study-sessions/{id}`          | DELETE | Remove a session                |

### Goals

| Endpoint                   | Method | Description          |
| -------------------------- | ------ | -------------------- |
| `/api/goals/user/{userId}` | GET    | List active goals    |
| `/api/goals`               | POST   | Create a new goal    |
| `/api/goals/{id}`          | PUT    | Update goal progress |

### Subjects

| Endpoint        | Method | Description                       |
| --------------- | ------ | --------------------------------- |
| `/api/subjects` | POST   | Create a subject with a color tag |

---

## 🗄 Database Configuration

* **Primary Database**: PostgreSQL
* **Optional (Development/Test)**: H2 Database

### PostgreSQL Setup

Configure your database connection in `application.properties` or `application.yml`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/studyplanner
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### H2 (Optional)

* H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
* JDBC URL: `jdbc:h2:mem:studyplanner`
* User: `sa`
* Password: *(empty)*

> **Production Tip**: PostgreSQL is the recommended database for production environments.

---

## 📸 Screenshots & Features Overview

Below are real screenshots from the application, highlighting the main features and user experience.

### 🔐 Authentication

![Login Screen](.assets/login.png)

Secure authentication with JWT-based login, ensuring user data protection and session control.

---

### 📊 Dashboard & Analytics

![Dashboard](.assets/dashboard.png)

A centralized dashboard showing:

* Study streaks
* Total focused hours
* Session statistics
* Visual analytics and charts

---

### 🍅 Pomodoro Timer

![Pomodoro Timer](.assets/pomodoro.png)

A fully configurable Pomodoro timer featuring:

* Custom focus and break durations
* Visual circular progress indicator
* Seamless mode switching
* Automatic accumulation of study time

---

### 📅 Study Calendar

![Calendar](.assets/calendario.png)

A calendar view to track study sessions over time, making it easy to visualize productivity and consistency.

---

### 📝 Study Sessions & Subjects

![New Session](.assets/novasessao.png)

Create and manage study sessions manually or through the Pomodoro timer.

![New Subject](.assets/novamateria.png)

Organize your studies by subjects with custom color tags for better visual identification.

---

### 🎯 Goals & Planning

![New Goal](.assets/novameta.png)

Set and track:

* Weekly goals
* Monthly goals
* Long-term objectives

Progress is updated dynamically based on completed study sessions.

---

### ⚙️ Settings & Customization

![Settings](.assets/configuracoes.png)

Personalize the application with:

* Light, Dark, and System themes
* Adjustable font sizes
* Sound effects control
* Password management

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project.
2. Create your feature branch:

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. Push to the branch:

   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

## 🚀 Future Roadmap

* [ ] PWA (Progressive Web App) support for mobile installation
* [ ] Flashcards system for active recall
* [ ] Social features (study groups)
* [ ] Export reports to PDF

---

Made by **Augusto Soares**
