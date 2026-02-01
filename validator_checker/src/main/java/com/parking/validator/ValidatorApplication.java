package com.parking.validator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ValidatorApplication {

        public static void main(String[] args) {
                SpringApplication.run(ValidatorApplication.class, args);
                System.out.println("🚀 Parking Validator Service Started!");
                System.out.println("📡 Listening on http://localhost:8080");
                System.out.println("⏰ Automatic slot release scheduler enabled");
        }
}
