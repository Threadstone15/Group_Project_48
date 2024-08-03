package com.example.crud.dao;

import com.example.crud.model.Item;
import com.example.crud.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ItemDAO {
    public List<Item> getAllItems() throws SQLException {
        List<Item> items = new ArrayList<>();
        String query = "SELECT * FROM items";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                Item item = new Item();
                item.setId(rs.getLong("id"));
                item.setName(rs.getString("name"));
                items.add(item);
            }
        }
        return items;
    }

    public Item getItemById(Long id) throws SQLException {
        Item item = null;
        String query = "SELECT * FROM items WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    item = new Item();
                    item.setId(rs.getLong("id"));
                    item.setName(rs.getString("name"));
                }
            }
        }
        return item;
    }

    public void saveItem(Item item) throws SQLException {
        String query = item.getId() == null ? 
            "INSERT INTO items (name) VALUES (?)" : 
            "UPDATE items SET name = ? WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setString(1, item.getName());
            if (item.getId() != null) {
                pstmt.setLong(2, item.getId());
            }
            pstmt.executeUpdate();
        }
    }

    public void deleteItem(Long id) throws SQLException {
        String query = "DELETE FROM items WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setLong(1, id);
            pstmt.executeUpdate();
        }
    }
}
