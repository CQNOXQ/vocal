package com.studytracker.words;

import com.studytracker.support.AuthUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/word-logs")
public class WordLogController {
    private final WordLogRepository repo;
    private final AuthUtils auth;

    public WordLogController(WordLogRepository repo, AuthUtils auth) {
        this.repo = repo;
        this.auth = auth;
    }

    record CreateReq(@NotNull OffsetDateTime date, String book, @NotNull Integer count, String note, Long subjectId, 
                     OffsetDateTime startTime, OffsetDateTime endTime) {}

    @PostMapping
    public WordLog create(@Valid @RequestBody CreateReq req) {
        WordLog wl = new WordLog();
        wl.setUserId(auth.currentUserId());
        wl.setSubjectId(req.subjectId());
        // 前端发送的 OffsetDateTime 包含时区信息，直接提取本地日期即可
        // 因为前端是用的系统时间，已经是我们想要的时区了
        LocalDate date = req.date().toLocalDate();
        wl.setDate(date);
        wl.setBook(req.book());
        wl.setCount(req.count());
        wl.setNote(req.note());
        
        // 如果有开始和结束时间（计时器学习），保存时间段
        if (req.startTime() != null && req.endTime() != null) {
            wl.setStartTime(req.startTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime());
            wl.setEndTime(req.endTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime());
        }
        
        return repo.save(wl);
    }
    
    @GetMapping
    public List<WordLog> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        // 查询范围已经是 LocalDate，直接使用即可
        return repo.findByUserIdAndDateBetweenOrderByDateAsc(auth.currentUserId(), from, to);
    }
}


