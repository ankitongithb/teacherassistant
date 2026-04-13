package com.ta.service;

import com.ta.config.JwtUtil;
import com.ta.dto.auth.AuthResponse;
import com.ta.dto.auth.LoginRequest;
import com.ta.dto.auth.RegisterRequest;
import com.ta.exception.DuplicateResourceException;
import com.ta.model.Teacher;
import com.ta.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (teacherRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        Teacher teacher = Teacher.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        teacher = teacherRepository.save(teacher);

        String token = jwtUtil.generateToken(teacher.getEmail(), teacher.getId(), teacher.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(teacher.getId())
                .name(teacher.getName())
                .email(teacher.getEmail())
                .role(teacher.getRole().name())
                .profileCompleted(teacher.getProfileCompleted())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Teacher teacher = teacherRepository.findByEmailAndIsDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), teacher.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(teacher.getEmail(), teacher.getId(), teacher.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(teacher.getId())
                .name(teacher.getName())
                .email(teacher.getEmail())
                .role(teacher.getRole().name())
                .profileCompleted(teacher.getProfileCompleted())
                .build();
    }
}
