// dao/UserDAO.java
package com.gym.dao;

import com.gym.model.User;
import com.gym.util.DBConnection;

import java.sql.*;

public class UserDAO {
    private Connection connection;

    public UserDAO() throws SQLException {
        this.connection = DBConnection.getConnection();
    }

    public User findByEmail(String email) throws SQLException {
        String query = "SELECT * FROM users WHERE email = ?";
        PreparedStatement stmt = connection.prepareStatement(query);
        stmt.setString(1, email);
        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            return new User(rs.getInt("id"), rs.getString("email"), rs.getString("password"), Role.valueOf(rs.getString("role")));
        }
        return null;
    }

    public void save(User user) throws SQLException {
        String query = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
        PreparedStatement stmt = connection.prepareStatement(query);
        stmt.setString(1, user.getEmail());
        stmt.setString(2, user.getPassword());
        stmt.setString(3, user.getRole().name());
        stmt.executeUpdate();
    }
}
