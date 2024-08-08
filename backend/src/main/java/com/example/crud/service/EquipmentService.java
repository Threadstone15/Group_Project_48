package com.example.crud.service;

import com.example.crud.dao.EquipmentDAO;
import com.example.crud.model.Equipment;

import java.sql.SQLException;
import java.util.List;

public class EquipmentService {
    private EquipmentDAO equipmentDAO = new EquipmentDAO();

    public List<Equipment> getAllEquipment() throws SQLException {
        return equipmentDAO.getAllEquipment();
    }

    public Equipment getEquipmentById(Long id) throws SQLException {
        return equipmentDAO.getEquipmentById(id);
    }

    public void saveEquipment(Equipment equipment) throws SQLException {
        equipmentDAO.saveEquipment(equipment);
    }

    public void deleteEquipment(Long id) throws SQLException {
        equipmentDAO.deleteEquipment(id);
    }
}
