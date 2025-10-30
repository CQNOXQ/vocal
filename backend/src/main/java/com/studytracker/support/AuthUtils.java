package com.studytracker.support;

import com.studytracker.user.User;
import com.studytracker.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtils {
    private final UserRepository userRepository;

    public AuthUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new IllegalStateException("Unauthenticated");
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public Long currentUserId() { return currentUser().getId(); }
}






