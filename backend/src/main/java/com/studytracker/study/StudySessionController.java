package com.studytracker.study;

import com.studytracker.support.AuthUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {
    private final StudySessionRepository repo;
    private final AuthUtils auth;

    public StudySessionController(StudySessionRepository repo, AuthUtils auth) {
        this.repo = repo;
        this.auth = auth;
    }

    record CreateReq(@NotNull Long subjectId, @NotNull OffsetDateTime startTime, @NotNull OffsetDateTime endTime, String note) {}

    @PostMapping
    public StudySession create(@Valid @RequestBody CreateReq req) {
        StudySession s = new StudySession();
        s.setUserId(auth.currentUserId());
        s.setSubjectId(req.subjectId());
        s.setStartTime(req.startTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime());
        s.setEndTime(req.endTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime());
        s.setNote(req.note());
        return repo.save(s);
    }

    @GetMapping
    public List<StudySession> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        // 查询范围基于北京时间的日期
        LocalDateTime fromUtc = from.atStartOfDay().atZone(ZoneId.of("Asia/Shanghai")).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        LocalDateTime toUtc = to.plusDays(1).atStartOfDay().atZone(ZoneId.of("Asia/Shanghai")).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        return repo.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(auth.currentUserId(), fromUtc, toUtc);
    }

    @GetMapping("/days/{date}")
    public ResponseEntity<?> day(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // 查询范围基于北京时间的日期
        LocalDateTime fromUtc = date.atStartOfDay().atZone(ZoneId.of("Asia/Shanghai")).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        LocalDateTime toUtc = date.plusDays(1).atStartOfDay().atZone(ZoneId.of("Asia/Shanghai")).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        List<StudySession> sessions = repo.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(auth.currentUserId(), fromUtc, toUtc);
        int totalMinutes = sessions.stream().mapToInt(s -> (int) java.time.Duration.between(s.getStartTime(), s.getEndTime()).toMinutes()).sum();
        return ResponseEntity.ok(Map.of("sessions", sessions, "totalMinutes", totalMinutes));
    }
}





