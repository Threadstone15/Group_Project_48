package com.example.crud.dao;

import com.example.crud.model.EquipmentMaintenance;
import com.example.crud.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EquipmentMaintenanceDAO {

    public List<EquipmentMaintenance> getAllEquipmentMaintenance() throws SQLException {
        List<EquipmentMaintenance> equipmentMaintenanceList = new ArrayList<>();
        String query = "SELECT * FROM equipment_maintenance";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                EquipmentMaintenance equipmentMaintenance = new EquipmentMaintenance();
                equipmentMaintenance.setId(rs.getLong("id"));
                equipmentMaintenance.setEquipmentId(rs.getLong("equipment_id"));
                equipmentMaintenance.setMaintenanceDate(rs.getDate("maintenance_date"));
                equipmentMaintenance.setDetails(rs.getString("details"));
                equipmentMaintenanceList.add(equipmentMaintenance);
            }
        }
        return equipmentMaintenanceList;
    }

    public EquipmentMaintenance getEquipmentMaintenanceById(Long id) throws SQLException {
        EquipmentMaintenance equipmentMaintenance = null;
        String query = "SELECT * FROM equipment_maintenance WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    equipmentMaintenance = new EquipmentMaintenance();
                    equipmentMaintenance.setId(rs.getLong("id"));
                    equipmentMaintenance.setEquipmentId(rs.getLong("equipment_id"));
                    equipmentMaintenance.setMaintenanceDate(rs.getDate("maintenance_date"));
                    equipmentMaintenance.setDetails(rs.getString("details"));
                }
            }
        }
        return equipmentMaintenance;
    }

    public void saveEquipmentMaintenance(EquipmentMaintenance equipmentMaintenance) throws SQLException {
        String query = equipmentMaintenance.getId() == null ?
            "INSERT INTO equipment_maintenance (equipment_id, maintenance_date, details) VALUES (?, ?, ?)" :
            "UPDATE equipment_maintenance SET equipment_id = ?, maintenance_date = ?, details = ? WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, equipmentMaintenance.getEquipmentId());
            pstmt.setDate(2, equipmentMaintenance.getMaintenanceDate());
            pstmt.setString(3, equipmentMaintenance.getDetails());
            if (equipmentMaintenance.getId() != null) {
                pstmt.setLong(4, equipmentMaintenance.getId());
            }
            pstmt.executeUpdate();
        }
    }

    public void deleteEquipmentMaintenance(Long id) throws SQLException {
        String query = "DELETE FROM equipment_maintenance WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            pstmt.executeUpdate();
        }
    }
}
