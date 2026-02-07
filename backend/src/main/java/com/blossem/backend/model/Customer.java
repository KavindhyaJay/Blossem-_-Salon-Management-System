package com.blossem.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;

    // Personal Details
    private String name;
    private String phone;
    private String email;

}