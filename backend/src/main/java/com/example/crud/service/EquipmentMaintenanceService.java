package com.example.crud.service;

import com.example.crud.dao.EquipmentMaintenanceDAO;
import com.example.crud.model.EquipmentMaintenance;

import java.sql.SQLException;
import java.util.List;

public class EquipmentMaintenanceService {
    private EquipmentMaintenanceDAO equipmentMaintenanceDAO = new EquipmentMaintenanceDAO();

    public List<EquipmentMaintenance> getAllEquipmentMaintenance() throws SQLException {
        return equipmentMaintenanceDAO.getAllEquipmentMaintenance();
    }

    public EquipmentMaintenance getEquipmentMaintenanceById(Long id) throws SQLException {
        return equipmentMaintenanceDAO.getEquipmentMaintenanceById(id);
    }

    public void saveEquipmentMaintenance(EquipmentMaintenance equipmentMaintenance) throws SQLException {
        equipmentMaintenanceDAO.saveEquipmentMaintenance(equipmentMaintenance);
    }

    public void deleteEquipmentMaintenance(Long id) throws SQLException {
        equipmentMaintenanceDAO.deleteEquipmentMaintenance(id);
    }
}
