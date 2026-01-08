package com.studyplanner.backend.service;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRecoveryEmail(String toEmail, String recoveryCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("seu.email@gmail.com"); 
            message.setTo(toEmail);                
            message.setSubject("Recuperação de Senha - Study Planner");
            message.setText("Olá!\n\nSeu código de recuperação de senha é: " + recoveryCode + "\n\n" +
                            "Se você não solicitou isso, ignore este e-mail.");

            mailSender.send(message);
            System.out.println("E-mail enviado com sucesso para: " + toEmail);
        } catch (MailException e) {
            System.err.println("Erro ao enviar e-mail: " + e.getMessage());
        }
    }
}