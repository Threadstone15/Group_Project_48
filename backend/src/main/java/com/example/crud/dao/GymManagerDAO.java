package com.example.crud.dao;

import com.example.crud.model.GymManager;
import com.example.crud.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class GymManagerDAO {
    public List<GymManager> getAllGymManagers() throws SQLException {
        List<GymManager> gymManagers = new ArrayList<>();
        String query = "SELECT * FROM gym_managers";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                GymManager gymManager = new GymManager();
                gymManager.setManagerId(rs.getLong("manager_id"));
                gymManager.setName(rs.getString("name"));
                gymManager.setEmail(rs.getString("email"));
                gymManager.setPhone(rs.getString("phone"));
                gymManager.setHireDate(rs.getDate("hire_date"));
                gymManagers.add(gymManager);
            }
        }
        return gymManagers;
    }

    public GymManager getGymManagerById(Long id) throws SQLException {
        GymManager gymManager = null;
        String query = "SELECT * FROM gym_managers WHERE manager_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    gymManager = new GymManager();
                    gymManager.setManagerId(rs.getLong("manager_id"));
                    gymManager.setName(rs.getString("name"));
                    gymManager.setEmail(rs.getString("email"));
                    gymManager.setPhone(rs.getString("phone"));
                    gymManager.setHireDate(rs.getDate("hire_date"));
                }
            }
        }
        return gymManager;
    }

    public void saveGymManager(GymManager gymManager) throws SQLException {
        String query = gymManager.getManagerId() == null ?
            "INSERT INTO gym_managers (name, email, phone, hire_date) VALUES (?, ?, ?, ?)" :
            "UPDATE gym_managers SET name = ?, email = ?, phone = ?, hire_date = ? WHERE manager_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setString(1, gymManager.getName());
            pstmt.setString(2, gymManager.getEmail());
            pstmt.setString(3, gymManager.getPhone());
            pstmt.setDate(4, gymManager.getHireDate());
            if (gymManager.getManagerId() != null) {
                pstmt.setLong(5, gymManager.getManagerId());
            }
            pstmt.executeUpdate();
        }
    }

    public void deleteGymManager(Long id) throws SQLException {
        String query = "DELETE FROM gym_managers WHERE manager_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            pstmt.executeUpdate();
        }
    }
}
