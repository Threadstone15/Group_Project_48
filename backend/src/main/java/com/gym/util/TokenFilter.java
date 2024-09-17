// util/TokenFilter.java
package com.gym.util;

import com.gym.service.AuthService;
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

public class TokenFilter implements Filter {
    private AuthService authService;

    public void init(FilterConfig filterConfig) {
        this.authService = new AuthService((UserDAO) filterConfig.getServletContext().getAttribute("dbConnection"));
    }

    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String token = request.getHeader("Authorization");
        if (token != null && authService.validateToken(token)) {
            chain.doFilter(req, res);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Unauthorized access\"}");
        }
    }

    public void destroy() {}
}
