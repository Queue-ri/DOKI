package com.doki.commonservice.auth.controller;

import com.doki.commonservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Queue-ri
 */

@Slf4j
@RequiredArgsConstructor
@Controller
@RequestMapping("/auth")
public class AuthController {
    /*
        view sign-up page - 회원가입 페이지 조회
    */
    private final JwtUtil jwtUtil;

    @Value("${cloud.aws.cloudfront.domain}")
    private String cdnDomain;

    @GetMapping("/sign-up")
    public String viewSignUpPage(Model model) {
        model.addAttribute("cdnDomain", cdnDomain);

        return "auth/sign_up";
    }
}
