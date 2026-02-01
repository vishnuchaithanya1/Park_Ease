package com.parking.validator.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import java.util.TimeZone;

@Configuration
public class TimeZoneConfig {

    @PostConstruct
    public void init() {
        // Setting Spring Boot SetTimeZone
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        System.out.println("Spring boot application running in IST timezone: " + TimeZone.getDefault().getID());
    }
}
