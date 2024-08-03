package com.example.crud.servlet;

import com.example.crud.model.Item;
import com.example.crud.service.ItemService;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/items/*")
public class ItemServlet extends HttpServlet {
    private ItemService itemService = new ItemService();
    private Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Handle preflight requests
        resp.setContentType("text/plain");
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            // Handle CORS preflight request
            resp.setHeader("Access-Control-Allow-Origin", "*");

            List<Item> items = itemService.getAllItems();
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print(gson.toJson(items));
            out.flush();
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            resp.setHeader("Access-Control-Allow-Origin", "*");
            
            Item item = gson.fromJson(req.getReader(), Item.class);
            itemService.saveItem(item);
            resp.setStatus(HttpServletResponse.SC_CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            resp.setHeader("Access-Control-Allow-Origin", "*");

            Long id = Long.parseLong(req.getPathInfo().substring(1));
            Item item = gson.fromJson(req.getReader(), Item.class);
            item.setId(id);
            itemService.saveItem(item);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            resp.setHeader("Access-Control-Allow-Origin", "*");

            Long id = Long.parseLong(req.getPathInfo().substring(1));
            itemService.deleteItem(id);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
