package utils;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.ResultSet;

public class DBConnection {

    public static Connection getConnection() {
        Connection connection = null;
        try {
            // Database URL and credentials
            String url = "jdbc:mysql://mysql-rad.alwaysdata.net:3306/rad_gymverse?useSSL=false&serverTimezone=UTC";
            String username = "rad";
            String password = "ucsc_rad_123";

            // Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Establish the connection
            connection = DriverManager.getConnection(url, username, password);
            System.out.println("Connection to the database was successful!");

            return connection;

        } catch (SQLException | ClassNotFoundException e) {
            System.out.println("Failed to connect to the database.");
            e.printStackTrace();
            return null;
        }
    }

    public static void printTables(Connection connection) {
        ResultSet tables = null;
        try {
            // Get DatabaseMetaData object
            DatabaseMetaData metaData = connection.getMetaData();

            // Retrieve tables information
            tables = metaData.getTables(null, null, "%", new String[]{"TABLE"});

            // Print the names of tables
            System.out.println("Tables in the database:");
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                System.out.println(tableName);
            }

        } catch (SQLException e) {
            System.out.println("Error retrieving tables.");
            e.printStackTrace();
        } finally {
            // Ensure the ResultSet is closed
            if (tables != null) {
                try {
                    tables.close();
                } catch (SQLException e) {
                    System.out.println("Error closing the ResultSet.");
                    e.printStackTrace();
                }
            }
        }
    }
}
