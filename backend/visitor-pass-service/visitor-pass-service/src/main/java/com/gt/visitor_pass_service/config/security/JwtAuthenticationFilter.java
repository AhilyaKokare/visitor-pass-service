package com.gt.visitor_pass_service.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Skip logging for common endpoints to reduce noise
        boolean shouldLog = !requestURI.contains("/actuator") && !requestURI.contains("/favicon");

        if (shouldLog) {
            logger.debug("=== JWT Filter Processing ===");
            logger.debug("Request: {} {}", method, requestURI);
        }

        try {
            String jwt = getJwtFromRequest(request);

            if (shouldLog) {
                logger.debug("JWT Token present: {}", jwt != null);
                if (jwt != null) {
                    logger.debug("JWT Token length: {}", jwt.length());
                }
            }

            if (StringUtils.hasText(jwt)) {
                boolean isValid = tokenProvider.validateToken(jwt);
                if (shouldLog) {
                    logger.debug("JWT Token valid: {}", isValid);
                }

                if (isValid) {
                    String username = tokenProvider.getUsernameFromJWT(jwt);
                    if (shouldLog) {
                        logger.debug("Username from JWT: {}", username);
                    }

                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    if (shouldLog) {
                        logger.debug("Authentication set successfully for user: {}", username);
                    }
                } else if (shouldLog) {
                    logger.warn("JWT Token validation failed for request: {} {}", method, requestURI);
                }
            } else if (shouldLog) {
                logger.debug("No JWT token found in request headers");
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for request: {} {}", method, requestURI, ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", bearerToken != null ? "Bearer ***" : "null");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}