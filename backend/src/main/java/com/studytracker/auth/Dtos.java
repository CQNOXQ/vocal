package com.studytracker.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class Dtos {}

record CreateInviteCodeRequest(String expiresInDays) {}

record RegisterRequest(@Email @NotBlank String email, @NotBlank String password, String nickname, 
                       @NotBlank String inviteCode) {}

record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

record RefreshRequest(@NotBlank String refreshToken) {}

record TokenResponse(String accessToken, String refreshToken) {}

