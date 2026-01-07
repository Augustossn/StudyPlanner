package com.studyplanner.backend.repository;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest // Configura um banco H2 em memória apenas para este teste
class StudySessionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager; // Ajuda a salvar dados no banco de teste

    @Autowired
    private StudySessionRepository repository; // O Repositório que vamos testar

    @Test
    void deveCalcularTotalDeMinutosCorretamente() {
        // 1. CENÁRIO (Criar dados falsos no banco H2)
        User user = new User();
        user.setName("Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123");
        entityManager.persist(user); // Salva user

        Subject subject = new Subject();
        subject.setName("Java");
        subject.setUser(user);
        entityManager.persist(subject); // Salva materia

        StudySession s1 = new StudySession();
        s1.setUser(user);
        s1.setSubject(subject);
        s1.setDurationMinutes(60); // 1 hora
        s1.setDate(LocalDateTime.now());
        entityManager.persist(s1);

        StudySession s2 = new StudySession();
        s2.setUser(user);
        s2.setSubject(subject);
        s2.setDurationMinutes(30); // 30 min
        s2.setDate(LocalDateTime.now());
        entityManager.persist(s2);

        // Força a gravação no banco
        entityManager.flush();

        // 2. AÇÃO (Chama o método customizado do repositório)
        Integer total = repository.getTotalStudyMinutes(user.getId());

        // 3. VERIFICAÇÃO
        assertThat(total).isEqualTo(90); // 60 + 30 tem que dar 90
    }

    @Test
    void deveRetornarZeroSeNaoHouverSessoes() {
        // Cenário: Usuário existe mas não estudou nada
        User user = new User();
        user.setName("Preguiçoso");
        entityManager.persist(user);
        entityManager.flush();

        // Ação
        Integer total = repository.getTotalStudyMinutes(user.getId());

        // Verificação (Sua query tem COALESCE? Se sim, retorna 0. Se não, retorna null)
        // No seu código você usou COALESCE(SUM(...), 0), então deve retornar 0.
        assertThat(total).isEqualTo(0);
    }

    @Test
    void deveFiltrarSessoesRecentes() {
        User user = new User();
        entityManager.persist(user);

        Subject subject = new Subject();
        subject.setUser(user);
        entityManager.persist(subject);

        // Sessão Antiga (10 dias atrás)
        StudySession antiga = new StudySession();
        antiga.setUser(user);
        antiga.setSubject(subject);
        antiga.setDate(LocalDateTime.now().minusDays(10));
        entityManager.persist(antiga);

        // Sessão Recente (Hoje)
        StudySession recente = new StudySession();
        recente.setUser(user);
        recente.setSubject(subject);
        recente.setDate(LocalDateTime.now());
        entityManager.persist(recente);

        entityManager.flush();

        // Ação: Busca sessões a partir de 7 dias atrás
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        List<StudySession> resultado = repository.findRecentSessions(user.getId(), seteDiasAtras);

        // Verificação
        assertThat(resultado).hasSize(1); // Só deve vir a recente
        assertThat(resultado.get(0).getDate()).isEqualTo(recente.getDate());
    }
}