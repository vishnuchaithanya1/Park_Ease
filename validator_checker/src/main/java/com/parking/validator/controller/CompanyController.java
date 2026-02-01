package com.parking.validator.controller;

import com.parking.validator.model.Company;
import com.parking.validator.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/create")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        if (company == null) {
            return ResponseEntity.status(400).body("Company details are required");
        }
        Company createdCompany = companyService.createCompany(company);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Company created successfully");
        response.put("data", createdCompany);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", companies);

        return ResponseEntity.ok(response);
    }
}
