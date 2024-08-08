package com.example.crud.service;

import com.example.crud.dao.GymManagerDAO;
import com.example.crud.model.GymManager;

import java.sql.SQLException;
import java.util.List;

public class GymManagerService {
    private GymManagerDAO gymManagerDAO = new GymManagerDAO();

    public List<GymManager> getAllGymManagers() throws SQLException {
        return gymManagerDAO.getAllGymManagers();
    }

    public GymManager getGymManagerById(Long id) throws SQLException {
        return gymManagerDAO.getGymManagerById(id);
    }

    public void saveGymManager(GymManager gymManager) throws SQLException {
        gymManagerDAO.saveGymManager(gymManager);
    }

    public void deleteGymManager(Long id) throws SQLException {
        gymManagerDAO.deleteGymManager(id);
    }
}
