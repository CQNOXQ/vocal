package com.studytracker.auth;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class InviteCodeService {
    
    private final Random random = new Random();
    
    /**
     * 生成8位字母数字混合邀请码
     */
    public String generateInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 移除容易混淆的字符
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}

