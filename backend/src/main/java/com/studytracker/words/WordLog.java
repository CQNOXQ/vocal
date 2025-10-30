package com.studytracker.words;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.studytracker.study.LocalDateTimeToBeijingSerializer;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "word_logs")
@Getter
@Setter
@NoArgsConstructor
public class WordLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "subject_id")
    private Long subjectId;
    @Column(nullable = false)
    private LocalDate date;
    private String book;
    @Column(nullable = false)
    private Integer count;
    private String note;
    @Column(name = "start_time")
    @JsonSerialize(using = LocalDateTimeToBeijingSerializer.class)
    private LocalDateTime startTime;
    @Column(name = "end_time")
    @JsonSerialize(using = LocalDateTimeToBeijingSerializer.class)
    private LocalDateTime endTime;
    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}




