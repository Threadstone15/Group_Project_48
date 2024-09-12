import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    public static Connection getConnection() {
        Connection connection = null;
        try {
            // Replace with your actual database name
            String url = "jdbc:mysql://mysql-rad.alwaysdata.net:3306/rad_gymverse";
            // Replace with your actual username
            String username = "rad";
            // Replace with your actual password
            String password = "ucsc_rad_123";

            // Establish the connection
            connection = DriverManager.getConnection(url, username, password);

            // If the connection is successful, print this message
            System.out.println("Connection to the database was successful!");

            // Create table and insert test data
            createTableAndInsertData(connection);

        } catch (SQLException e) {
            // If the connection fails, print this message and the error
            System.out.println("Failed to connect to the database.");
            e.printStackTrace();
        }
        return connection;
    }

    public static void createTableAndInsertData(Connection connection) {
        Statement stmt = null;
        try {
            // Create a Statement object
            stmt = connection.createStatement();

            // SQL statement to create a table
            String createTableSQL = "CREATE TABLE IF NOT EXISTS test_table (" +
                                     "id INT AUTO_INCREMENT PRIMARY KEY, " +
                                     "name VARCHAR(255) NOT NULL, " +
                                     "email VARCHAR(255) NOT NULL" +
                                     ")";

            // Execute the SQL statement
            stmt.executeUpdate(createTableSQL);
            System.out.println("Table created successfully!");

            // SQL statements to insert test data
            String insertDataSQL1 = "INSERT INTO test_table (name, email) VALUES ('Alice', 'alice@example.com')";
            String insertDataSQL2 = "INSERT INTO test_table (name, email) VALUES ('Bob', 'bob@example.com')";

            // Execute the SQL statements
            stmt.executeUpdate(insertDataSQL1);
            stmt.executeUpdate(insertDataSQL2);
            System.out.println("Test data inserted successfully!");

        } catch (SQLException e) {
            // Print SQL errors
            System.out.println("SQL error occurred.");
            e.printStackTrace();
        } finally {
            // Close the Statement object
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        // Test the connection and perform table operations
        getConnection();
    }
}
