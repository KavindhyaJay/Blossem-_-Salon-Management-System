package com.blossem.reception_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Send email notification to staff when customer arrives.
     * Includes: customer name, email, services, date, and time.
     */
    public void sendStaffNotification(String toEmail, String customerEmail, String customerName,
            String[] services, String date, String time) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Customer Arrival Notification - " + customerName);

            StringBuilder body = new StringBuilder();
            body.append("Dear Staff Member,\n\n");
            body.append("A customer has arrived for their appointment.\n\n");
            body.append("Customer Details:\n");
            body.append("- Name: ").append(customerName).append("\n");
            if (customerEmail != null && !customerEmail.isBlank()) {
                body.append("- Email: ").append(customerEmail).append("\n");
            }
            body.append("- Date: ").append(date).append("\n");
            body.append("- Time: ").append(time).append("\n");

            if (services != null && services.length > 0) {
                body.append("- Services: ");
                for (int i = 0; i < services.length; i++) {
                    body.append(services[i]);
                    if (i < services.length - 1) {
                        body.append(", ");
                    }
                }
                body.append("\n");
            }

            body.append("\nPlease be ready to serve the customer.\n\n");
            body.append("Best regards,\nReception Team");

            message.setText(body.toString());
            mailSender.send(message);

            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - log and continue
        }
    }
}
