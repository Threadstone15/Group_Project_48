// model/User.java
package com.gym.model;

public class User {
    private int id;
    private String email;
    private String password;
    private Role role;

    public User(int id, String email, String password, Role role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and setters
}

// model/Role.java
package com.gym.model;

public enum Role {
    TRAINER,
    OWNER,
    USER,
    SYSTEM_ADMIN,
    MANAGER
}
