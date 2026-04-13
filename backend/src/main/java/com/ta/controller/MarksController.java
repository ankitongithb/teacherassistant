package com.ta.controller;

import com.ta.dto.marks.MarksCreateDTO;
import com.ta.dto.marks.MarksDTO;
import com.ta.service.MarksService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarksController {

    private final MarksService marksService;

    @PostMapping
    public ResponseEntity<List<MarksDTO>> createMarks(Authentication auth, @Valid @RequestBody MarksCreateDTO dto) {
        return ResponseEntity.ok(marksService.createMarks(auth.getName(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarksDTO> updateMarks(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(marksService.updateMarks(auth.getName(), id, body.get("marksObtained")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarks(Authentication auth, @PathVariable Long id) {
        marksService.deleteMarks(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MarksDTO>> getMarks(
            Authentication auth,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String examName) {
        return ResponseEntity.ok(marksService.getMarks(auth.getName(), subjectId, examType, examName));
    }
}
