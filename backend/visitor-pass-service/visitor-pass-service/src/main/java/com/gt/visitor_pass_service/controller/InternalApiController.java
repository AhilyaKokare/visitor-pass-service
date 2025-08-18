package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.service.VisitorPassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal")
public class InternalApiController {

    private final VisitorPassService visitorPassService;

    public InternalApiController(VisitorPassService visitorPassService) {
        this.visitorPassService = visitorPassService;
    }

    @GetMapping("/passes/{id}")
    public ResponseEntity<VisitorPassResponse> getPassById(@PathVariable Long id) {
        // This method should be more detailed, but for now reuses the existing DTO
        VisitorPassResponse response = visitorPassService.getPassById(id);
        return ResponseEntity.ok(response);
    }
}