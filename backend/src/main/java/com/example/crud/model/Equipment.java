package com.example.crud.model;

import java.sql.Date;

public class Equipment {
    private Long equipmentId;
    private String name;
    private Date purchaseDate;
    private String status;
    private String maintenanceDuration;

    // Getters and Setters
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Date getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(Date purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMaintenanceDuration() { return maintenanceDuration; }
    public void setMaintenanceDuration(String maintenanceDuration) { this.maintenanceDuration = maintenanceDuration; }
}
