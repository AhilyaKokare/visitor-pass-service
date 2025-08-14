package com.gt.visitor_pass_service.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final InternalApiAuthenticationFilter internalApiAuthenticationFilter;


    public SecurityConfig(CustomUserDetailsService customUserDetailsService,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          InternalApiAuthenticationFilter internalApiAuthenticationFilter) {
        this.customUserDetailsService = customUserDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.internalApiAuthenticationFilter = internalApiAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // This is the ONLY cors() configuration you should have.
                // It enables the global CORS policy defined in your WebConfig class.
                .cors(Customizer.withDefaults())

                // Disable CSRF protection for stateless REST APIs.
                .csrf(csrf -> csrf.disable())

                // VVV THE CONFLICTING LINE HAS BEEN REMOVED FROM HERE VVV

                // Set up custom entry point for authentication errors.
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))

                // Configure session management to be stateless, as we are using JWTs.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Define authorization rules for your endpoints.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Allow public access to login/register
                        .requestMatchers("/api/internal/**").hasRole("INTERNAL_SERVICE") // Secure internal paths
                        .anyRequest().authenticated() // All other requests require authentication
                );

        // Add your custom JWT and internal API filters to the security chain.
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(internalApiAuthenticationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}