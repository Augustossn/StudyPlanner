package com.studyplanner.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.studyplanner.backend.model.StudySession; // Boa prática adicionar
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;

@DataJpaTest
class StudySessionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private StudySessionRepository repository;

    @Test
    void deveCalcularTotalDeMinutosCorretamente() {
        // 1. USUÁRIO VÁLIDO
        User user = new User();
        user.setName("Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123456");
        entityManager.persist(user);

        // 2. MATÉRIA VÁLIDA (Com Cor e Nome)
        Subject subject = new Subject();
        subject.setName("Java");
        subject.setColor("#FF0000"); // <--- COR OBRIGATÓRIA
        subject.setUser(user);
        entityManager.persist(subject);

        // 3. SESSÃO 1 (Com Título e Duração)
        StudySession s1 = new StudySession();
        s1.setTitle("Estudo Arrays"); // <--- TÍTULO OBRIGATÓRIO
        s1.setUser(user);
        s1.setSubject(subject);
        s1.setDurationMinutes(60); 
        s1.setDate(LocalDateTime.now());
        entityManager.persist(s1);

        // 4. SESSÃO 2
        StudySession s2 = new StudySession();
        s2.setTitle("Estudo Listas"); // <--- TÍTULO OBRIGATÓRIO
        s2.setUser(user);
        s2.setSubject(subject);
        s2.setDurationMinutes(30);
        s2.setDate(LocalDateTime.now());
        entityManager.persist(s2);

        entityManager.flush();

        // 2. AÇÃO
        Integer total = repository.getTotalStudyMinutes(user.getId());

        // 3. VERIFICAÇÃO
        assertThat(total).isEqualTo(90);
    }

    @Test
    void deveRetornarZeroSeNaoHouverSessoes() {
        // Usuário completo para evitar erro de validação @NotNull no User
        User user = new User();
        user.setName("Preguiçoso");
        user.setEmail("preguica@email.com");
        user.setPassword("123456");
        entityManager.persist(user);
        entityManager.flush();

        Integer total = repository.getTotalStudyMinutes(user.getId());

        assertThat(total).isEqualTo(0);
    }

    @Test
    void deveFiltrarSessoesRecentes() {
        User user = new User();
        user.setName("User Filtro");
        user.setEmail("filtro@email.com");
        user.setPassword("123456");
        entityManager.persist(user);

        Subject subject = new Subject();
        subject.setName("História");
        subject.setColor("#00FF00"); // <--- COR
        subject.setUser(user);
        entityManager.persist(subject);

        // Sessão Antiga
        StudySession antiga = new StudySession();
        antiga.setTitle("Sessão Velha"); // <--- TÍTULO
        antiga.setUser(user);
        antiga.setSubject(subject);
        antiga.setDurationMinutes(60); // <--- DURAÇÃO (Min 1)
        antiga.setDate(LocalDateTime.now().minusDays(10));
        entityManager.persist(antiga);

        // Sessão Recente
        StudySession recente = new StudySession();
        recente.setTitle("Sessão Nova"); // <--- TÍTULO
        recente.setUser(user);
        recente.setSubject(subject);
        recente.setDurationMinutes(60); // <--- DURAÇÃO
        recente.setDate(LocalDateTime.now());
        entityManager.persist(recente);

        entityManager.flush();

        // Ação
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        List<StudySession> resultado = repository.findRecentSessions(user.getId(), seteDiasAtras);

        // Verificação
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getTitle()).isEqualTo("Sessão Nova");
    }
}