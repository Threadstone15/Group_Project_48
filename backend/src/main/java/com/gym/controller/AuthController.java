// controller/AuthController.java
package com.gym.controller;

import com.gym.dao.UserDAO;
import com.gym.service.AuthService;
import com.gym.util.DBConnection;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

public class AuthController extends HttpServlet {
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        try {
            UserDAO userDAO = new UserDAO();
            this.authService = new AuthService(userDAO);
        } catch (SQLException e) {
            throw new ServletException("Unable to initialize database connection", e);
        }
    }

    // Rest of the login and signup logic...
}
