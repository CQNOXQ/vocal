package com.studytracker.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class JwtService {
    private final SecretKey signingKey;
    private final long accessTokenTtlMinutes;
    private final long refreshTokenTtlDays;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-ttl-minutes:60}") long accessTokenTtlMinutes,
            @Value("${app.jwt.refresh-token-ttl-days:7}") long refreshTokenTtlDays
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(toBase64(secret)));
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    private static String toBase64(String secret) {
        // 如果是纯文本而非 base64，转换为 base64
        try {
            Decoders.BASE64.decode(secret);
            return secret; // 已是 base64
        } catch (Exception ignored) {
            return java.util.Base64.getEncoder().encodeToString(secret.getBytes());
        }
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        log.debug("jwt: generate access token for subject={}", subject);
        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String subject) {
        Instant now = Instant.now();
        log.debug("jwt: generate refresh token for subject={}", subject);
        return Jwts.builder()
                .subject(subject)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTokenTtlDays, ChronoUnit.DAYS)))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractSubject(String token) {
        String subject = Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        log.trace("jwt: extracted subject={}", subject);
        return subject;
    }
}
