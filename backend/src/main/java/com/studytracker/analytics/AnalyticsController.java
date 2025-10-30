package com.studytracker.analytics;

import com.studytracker.study.StudySession;
import com.studytracker.study.StudySessionRepository;
import com.studytracker.support.AuthUtils;
import com.studytracker.words.WordLog;
import com.studytracker.words.WordLogRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final StudySessionRepository sessionRepo;
    private final WordLogRepository wordLogRepo;
    private final AuthUtils auth;

    public AnalyticsController(StudySessionRepository sessionRepo, WordLogRepository wordLogRepo, AuthUtils auth) {
        this.sessionRepo = sessionRepo;
        this.wordLogRepo = wordLogRepo;
        this.auth = auth;
    }

    @GetMapping("/daily")
    public List<Map<String, Object>> daily(@RequestParam(defaultValue = "30d") String range) {
        int days = range.equals("30d") ? 30 : (range.equals("7d") ? 7 : 30);
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(days - 1);

        LocalDateTime fromUtc = from.atStartOfDay();
        LocalDateTime toUtc = to.plusDays(1).atStartOfDay();

        List<StudySession> sessions = sessionRepo.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
                auth.currentUserId(), fromUtc, toUtc);
        List<WordLog> words = wordLogRepo.findByUserIdAndDateBetweenOrderByDateAsc(
                auth.currentUserId(), from, to);

        Map<String, Integer> minutesByDate = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStartTime().toLocalDate().toString(),
                        Collectors.summingInt(s -> (int) java.time.Duration.between(s.getStartTime(), s.getEndTime()).toMinutes())
                ));

        Map<String, Integer> wordsByDate = words.stream()
                .collect(Collectors.groupingBy(
                        w -> w.getDate().toString(),
                        Collectors.summingInt(WordLog::getCount)
                ));

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            String dateStr = current.toString();
            Map<String, Object> day = new HashMap<>();
            day.put("date", dateStr);
            day.put("minutes", minutesByDate.getOrDefault(dateStr, 0));
            day.put("words", wordsByDate.getOrDefault(dateStr, 0));
            result.add(day);
            current = current.plusDays(1);
        }
        return result;
    }
}







