package com.studytracker.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InviteCodeRepository extends JpaRepository<InviteCode, Long> {
    
    Optional<InviteCode> findByCode(String code);
}

