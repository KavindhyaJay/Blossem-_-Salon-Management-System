package com.salonapp.salonbackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "customers")
public class CustomerDoc {

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
}
