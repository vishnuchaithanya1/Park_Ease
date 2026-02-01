package com.parking.validator.controller;

import com.parking.validator.dto.JwtResponse;
import com.parking.validator.dto.LoginRequest;
import com.parking.validator.dto.MessageResponse;
import com.parking.validator.dto.SignupRequest;
import com.parking.validator.model.User;
import com.parking.validator.repository.UserRepository;
import com.parking.validator.security.JwtUtils;
import com.parking.validator.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
                try {
                        System.out.println("🔐 Login attempt for identifier: " + loginRequest.getIdentifier());

                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtUtils.generateJwtToken(authentication);

                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(item -> item.getAuthority())
                                        .collect(Collectors.toList());

                        String roleStr = roles.isEmpty() ? "user" : roles.get(0).replace("ROLE_", "").toLowerCase();

                        // Additional Admin Secret Check for Login (as requested by frontend)
                        if ("admin".equalsIgnoreCase(roleStr)) {
                                String adminSecret = loginRequest.getAdminSecret();
                                if (adminSecret == null || adminSecret.isEmpty()
                                                || !jwtUtils.validateJwtToken(adminSecret)) {
                                        return ResponseEntity.status(401).body(new MessageResponse(
                                                        "Error: Valid Admin Token is required for Administrative login."));
                                }
                                // Check if it's actually an invite/admin token
                                String subject = jwtUtils.getUserNameFromJwtToken(adminSecret);
                                if (!"admin_invite".equals(subject)) {
                                        return ResponseEntity.status(401)
                                                        .body(new MessageResponse("Error: Invalid token scope."));
                                }
                        }

                        System.out.println("✅ Login success for: " + userDetails.getEmail());

                        return ResponseEntity.ok(new JwtResponse(jwt,
                                        new JwtResponse.UserResponse(
                                                        userDetails.getId(),
                                                        userDetails.getName(),
                                                        userDetails.getEmail(),
                                                        roleStr,
                                                        roles)));
                } catch (Exception e) {
                        System.err.println("❌ Login Error: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.internalServerError()
                                        .body(new MessageResponse("Error: " + e.getMessage()));
                }
        }

        @GetMapping("/generate-admin-token")
        public ResponseEntity<?> generateAdminToken() {
                String token = jwtUtils.generateAdminInviteToken();
                return ResponseEntity.ok(com.parking.validator.dto.AdminInviteResponse.builder()
                                .token(token)
                                .message("Valid for 24 hours. Use this as 'adminSecret' in registration.")
                                .expiresAt(System.currentTimeMillis() + 24 * 60 * 60 * 1000)
                                .build());
        }

        @PostMapping({ "/signup", "/register" })
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
                System.out.println("DEBUG: Signup request for email: [" + signUpRequest.getEmail() + "]");

                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
                }

                String strRole = signUpRequest.getRole();
                User.Role activeRole = User.Role.user;

                // Admin Token Validation
                if ("admin".equalsIgnoreCase(strRole)) {
                        String adminSecret = signUpRequest.getAdminSecret();
                        if (adminSecret == null || adminSecret.isEmpty()) {
                                return ResponseEntity.status(403)
                                                .body(new MessageResponse("Error: Admin Invite Token is required."));
                        }
                        try {
                                if (!jwtUtils.validateJwtToken(adminSecret)) {
                                        throw new Exception("Invalid Token");
                                }
                                // Check if it's actually an invite token
                                String subject = jwtUtils.getUserNameFromJwtToken(adminSecret);
                                if (!"admin_invite".equals(subject)) {
                                        throw new Exception("Invalid token scope");
                                }
                                activeRole = User.Role.admin;
                        } catch (Exception e) {
                                return ResponseEntity.status(403).body(
                                                new MessageResponse("Error: Invalid or Expired Admin Invite Token."));
                        }
                }

                if (signUpRequest.getVehicleNumber() != null && !signUpRequest.getVehicleNumber().isEmpty() &&
                                userRepository.existsByVehicleNumber(signUpRequest.getVehicleNumber())) {
                        return ResponseEntity.badRequest()
                                        .body(new MessageResponse("Error: Vehicle Number is already in use!"));
                }

                // Create new user's account
                User user = User.builder()
                                .name(signUpRequest.getName())
                                .email(signUpRequest.getEmail())
                                .password(encoder.encode(signUpRequest.getPassword()))
                                .vehicleNumber(signUpRequest.getVehicleNumber())
                                .vehicleType(signUpRequest.getVehicleType())
                                .phone(signUpRequest.getPhone())
                                .role(activeRole)
                                .build();

                userRepository.save(java.util.Objects.requireNonNull(user));

                // Auto-login
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(),
                                                signUpRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new JwtResponse(jwt,
                                new JwtResponse.UserResponse(
                                                userDetails.getId(),
                                                userDetails.getName(),
                                                userDetails.getEmail(),
                                                activeRole.name(),
                                                roles)));
        }
}
