package com.studytracker.auth;

import com.studytracker.security.JwtService;
import com.studytracker.support.AuthUtils;
import com.studytracker.user.User;
import com.studytracker.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InviteCodeRepository inviteCodeRepository;
    private final InviteCodeService inviteCodeService;
    private final AuthUtils authUtils;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService, InviteCodeRepository inviteCodeRepository, InviteCodeService inviteCodeService, AuthUtils authUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.inviteCodeRepository = inviteCodeRepository;
        this.inviteCodeService = inviteCodeService;
        this.authUtils = authUtils;
    }

    @PostMapping("/invite-codes")
    public ResponseEntity<?> createInviteCode(@Valid @RequestBody CreateInviteCodeRequest req) {
        log.info("auth: create invite code request");
        
        // 默认30天有效期
        int days = 30;
        if (req.expiresInDays() != null && !req.expiresInDays().isEmpty()) {
            try {
                days = Integer.parseInt(req.expiresInDays());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid expiresInDays"));
            }
        }
        
        String code = inviteCodeService.generateInviteCode();
        InviteCode inviteCode = new InviteCode();
        inviteCode.setCode(code);
        inviteCode.setCreatedBy(authUtils.currentUserId());
        inviteCode.setCreatedAt(Instant.now());
        inviteCode.setExpiresAt(Instant.now().plusSeconds(days * 86400L));
        inviteCodeRepository.save(inviteCode);
        
        log.info("auth: invite code created code={} by userId={}", code, authUtils.currentUserId());
        return ResponseEntity.ok(Map.of("code", code, "expiresAt", inviteCode.getExpiresAt().toString()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        log.info("auth: register attempt email={}", req.email());
        
        // 验证邮箱是否已存在
        if (userRepository.findByEmail(req.email()).isPresent()) {
            log.warn("auth: register conflict email already exists email={}", req.email());
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        
        // 验证邀请码
        InviteCode inviteCode = inviteCodeRepository.findByCode(req.inviteCode())
                .orElse(null);
        
        if (inviteCode == null) {
            log.warn("auth: register invalid invite code");
            return ResponseEntity.badRequest().body(Map.of("error", "邀请码无效"));
        }
        
        if (inviteCode.getUsedBy() != null) {
            log.warn("auth: register invite code already used code={}", req.inviteCode());
            return ResponseEntity.badRequest().body(Map.of("error", "邀请码已被使用"));
        }
        
        if (inviteCode.getExpiresAt() != null && inviteCode.getExpiresAt().isBefore(Instant.now())) {
            log.warn("auth: register invite code expired code={}", req.inviteCode());
            return ResponseEntity.badRequest().body(Map.of("error", "邀请码已过期"));
        }
        
        User u = new User();
        u.setEmail(req.email());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setNickname(req.nickname());
        userRepository.save(u);
        
        // 标记邀请码为已使用
        inviteCode.setUsedBy(u.getId());
        inviteCode.setUsedAt(Instant.now());
        inviteCodeRepository.save(inviteCode);
        
        String access = jwtService.generateAccessToken(u.getEmail(), Map.of("uid", u.getId()));
        String refresh = jwtService.generateRefreshToken(u.getEmail());
        log.info("auth: register success uid={} email={}", u.getId(), u.getEmail());
        return ResponseEntity.ok(new TokenResponse(access, refresh));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            log.info("auth: login attempt email={}", req.email());
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
            String email = auth.getName();
            User u = userRepository.findByEmail(email).orElseThrow();
            String access = jwtService.generateAccessToken(email, Map.of("uid", u.getId()));
            String refresh = jwtService.generateRefreshToken(email);
            log.info("auth: login success uid={} email={}", u.getId(), email);
            return ResponseEntity.ok(new TokenResponse(access, refresh));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("auth: login bad credentials email={}", req.email());
            return ResponseEntity.status(401).body(Map.of("error", "邮箱或密码错误"));
        } catch (Exception e) {
            log.error("auth: login error email={} msg={}", req.email(), e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "登录失败: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest req) {
        log.debug("auth: refresh token request");
        String subject = jwtService.extractSubject(req.refreshToken());
        User u = userRepository.findByEmail(subject).orElseThrow();
        String access = jwtService.generateAccessToken(subject, Map.of("uid", u.getId()));
        String refresh = jwtService.generateRefreshToken(subject);
        log.debug("auth: refresh success uid={} email={}", u.getId(), subject);
        return ResponseEntity.ok(new TokenResponse(access, refresh));
    }
}
