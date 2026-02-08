package com.salonapp.salonbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SalonbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalonbackendApplication.class, args);
		System.out.println("=======================================");
		System.out.println("  SALON BACKEND IS RUNNING ON PORT 8081  ");
		System.out.println("=======================================");
	}

}
