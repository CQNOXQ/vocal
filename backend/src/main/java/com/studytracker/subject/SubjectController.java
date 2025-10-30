package com.studytracker.subject;

import com.studytracker.study.StudySessionRepository;
import com.studytracker.support.AuthUtils;
import com.studytracker.words.WordLogRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectRepository repo;
    private final AuthUtils auth;
    private final StudySessionRepository studySessionRepo;
    private final WordLogRepository wordLogRepo;

    public SubjectController(SubjectRepository repo, AuthUtils auth, 
                             StudySessionRepository studySessionRepo, WordLogRepository wordLogRepo) {
        this.repo = repo;
        this.auth = auth;
        this.studySessionRepo = studySessionRepo;
        this.wordLogRepo = wordLogRepo;
    }

    @GetMapping
    public List<Subject> list() {
        return repo.findByUserIdAndArchivedFalseOrderByCreatedAtDesc(auth.currentUserId());
    }

    record CreateSubjectRequest(@NotBlank String name, String colorHex, String studyType, Integer dailyTarget) {}

    @PostMapping
    public Subject create(@Valid @RequestBody CreateSubjectRequest req) {
        Subject s = new Subject();
        s.setUserId(auth.currentUserId());
        s.setName(req.name());
        s.setColorHex(req.colorHex());
        s.setStudyType(req.studyType() != null ? req.studyType() : "MINUTES");
        s.setDailyTarget(req.dailyTarget() != null ? req.dailyTarget() : 0);
        return repo.save(s);
    }

    record PatchSubjectRequest(String name, String colorHex, Boolean archived, String studyType, Integer dailyTarget) {}

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Long id, @RequestBody PatchSubjectRequest req) {
        return repo.findById(id).filter(s -> s.getUserId().equals(auth.currentUserId()))
                .map(s -> {
                    if (req.name() != null) s.setName(req.name());
                    if (req.colorHex() != null) s.setColorHex(req.colorHex());
                    if (req.archived() != null) s.setArchived(req.archived());
                    if (req.studyType() != null) s.setStudyType(req.studyType());
                    if (req.dailyTarget() != null) s.setDailyTarget(req.dailyTarget());
                    return ResponseEntity.ok(repo.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repo.findById(id).filter(s -> s.getUserId().equals(auth.currentUserId()))
                .map(s -> { 
                    // 删除所有相关的学习记录和背词记录
                    studySessionRepo.deleteBySubjectId(id);
                    wordLogRepo.deleteBySubjectId(id);
                    // 最后删除科目
                    repo.delete(s); 
                    return ResponseEntity.noContent().build(); 
                })
                .orElse(ResponseEntity.notFound().build());
    }
}


