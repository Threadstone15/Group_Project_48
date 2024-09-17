// service/AuthService.java
package com.gym.service;

import com.gym.dao.UserDAO;
import com.gym.model.User;
import io.jsonwebtoken.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Date;

public class AuthService {
    private static final String SECRET_KEY = "mySecretKey";
    private UserDAO userDAO;

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public String login(String email, String password) throws Exception {
        User user = userDAO.findByEmail(email);
        if (user != null && BCrypt.checkpw(password, user.getPassword())) {
            return generateToken(user);
        }
        throw new Exception("Invalid email or password");
    }

    public void signup(String email, String password, String role) throws Exception {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        User user = new User(0, email, hashedPassword, Role.valueOf(role.toUpperCase()));
        userDAO.save(user);
    }

    private String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
