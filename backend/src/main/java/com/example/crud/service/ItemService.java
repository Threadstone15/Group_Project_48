package com.example.crud.service;

import com.example.crud.dao.ItemDAO;
import com.example.crud.model.Item;

import java.sql.SQLException;
import java.util.List;

public class ItemService {
    private ItemDAO itemDAO = new ItemDAO();

    public List<Item> getAllItems() throws SQLException {
        return itemDAO.getAllItems();
    }

    public Item getItemById(Long id) throws SQLException {
        return itemDAO.getItemById(id);
    }

    public void saveItem(Item item) throws SQLException {
        itemDAO.saveItem(item);
    }

    public void deleteItem(Long id) throws SQLException {
        itemDAO.deleteItem(id);
    }
}
