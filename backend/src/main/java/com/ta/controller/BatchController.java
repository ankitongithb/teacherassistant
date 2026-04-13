package com.ta.controller;

import com.ta.dto.batch.BatchCreateDTO;
import com.ta.dto.batch.BatchDTO;
import com.ta.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getBatches(Authentication auth) {
        return ResponseEntity.ok(batchService.getBatches(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatch(id));
    }

    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(Authentication auth, @Valid @RequestBody BatchCreateDTO dto) {
        return ResponseEntity.ok(batchService.createBatch(auth.getName(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatchDTO> updateBatch(Authentication auth, @PathVariable Long id, @Valid @RequestBody BatchCreateDTO dto) {
        return ResponseEntity.ok(batchService.updateBatch(auth.getName(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(Authentication auth, @PathVariable Long id) {
        batchService.deleteBatch(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
