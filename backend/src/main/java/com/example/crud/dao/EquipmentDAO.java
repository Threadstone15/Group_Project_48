package com.example.crud.dao;

import com.example.crud.model.Equipment;
import com.example.crud.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EquipmentDAO {
    public List<Equipment> getAllEquipment() throws SQLException {
        List<Equipment> equipmentList = new ArrayList<>();
        String query = "SELECT * FROM equipment";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                Equipment equipment = new Equipment();
                equipment.setEquipmentId(rs.getLong("equipment_id"));
                equipment.setName(rs.getString("name"));
                equipment.setPurchaseDate(rs.getDate("purchase_date"));
                equipment.setStatus(rs.getString("status"));
                equipment.setMaintenanceDuration(rs.getString("maintenance_duration"));
                equipmentList.add(equipment);
            }
        }
        return equipmentList;
    }

    public Equipment getEquipmentById(Long id) throws SQLException {
        Equipment equipment = null;
        String query = "SELECT * FROM equipment WHERE equipment_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    equipment = new Equipment();
                    equipment.setEquipmentId(rs.getLong("equipment_id"));
                    equipment.setName(rs.getString("name"));
                    equipment.setPurchaseDate(rs.getDate("purchase_date"));
                    equipment.setStatus(rs.getString("status"));
                    equipment.setMaintenanceDuration(rs.getString("maintenance_duration"));
                }
            }
        }
        return equipment;
    }

    public void saveEquipment(Equipment equipment) throws SQLException {
        String query;
        if (equipment.getEquipmentId() == null) {
            query = "INSERT INTO equipment (name, purchase_date, status, maintenance_duration) VALUES (?, ?, ?, ?)";
        } else {
            query = "UPDATE equipment SET name = ?, purchase_date = ?, status = ?, maintenance_duration = ? WHERE equipment_id = ?";
        }
    
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
    
            pstmt.setString(1, equipment.getName());
    
            // Handle java.sql.Date for purchaseDate
            pstmt.setDate(2, equipment.getPurchaseDate());
    
            pstmt.setString(3, equipment.getStatus());
            pstmt.setString(4, equipment.getMaintenanceDuration());
    
            if (equipment.getEquipmentId() != null) {
                pstmt.setLong(5, equipment.getEquipmentId());
            }
    
            pstmt.executeUpdate();
        } catch (SQLException e) {
            // Log the error and rethrow for higher-level handling
            System.err.println("SQL Error: " + e.getMessage());
            throw e;
        }
    }
    

    public void deleteEquipment(Long id) throws SQLException {
        String query = "DELETE FROM equipment WHERE equipment_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            pstmt.executeUpdate();
        }
    }
}
