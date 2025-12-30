package com.fullstack.Salonms.security;

import com.fullstack.Salonms.util.PasswordUtil;
import org.springframework.stereotype.Component;

// Don't implement PasswordEncoder yet, just a simple utility
@Component
public class CustomPasswordEncoder {

    public String encode(String rawPassword) {
        return PasswordUtil.hashPassword(rawPassword);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        return PasswordUtil.verifyPassword(rawPassword, encodedPassword);
    }
}