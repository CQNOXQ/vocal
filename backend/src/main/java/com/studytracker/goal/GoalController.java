package com.studytracker.goal;

import com.studytracker.support.AuthUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalRepository repo;
    private final AuthUtils auth;

    public GoalController(GoalRepository repo, AuthUtils auth) {
        this.repo = repo;
        this.auth = auth;
    }

    @GetMapping
    public ResponseEntity<?> get() {
        return ResponseEntity.ok(repo.findByUserId(auth.currentUserId()).orElseGet(() -> {
            Goal g = new Goal();
            g.setUserId(auth.currentUserId());
            return repo.save(g);
        }));
    }

    record PutReq(@NotNull Integer dailyMinutesTarget, @NotNull Integer dailyWordsTarget) {}

    @PutMapping
    public Goal put(@Valid @RequestBody PutReq req) {
        Goal g = repo.findByUserId(auth.currentUserId()).orElseGet(() -> {
            Goal ng = new Goal();
            ng.setUserId(auth.currentUserId());
            return ng;
        });
        g.setDailyMinutesTarget(req.dailyMinutesTarget());
        g.setDailyWordsTarget(req.dailyWordsTarget());
        return repo.save(g);
    }
}






