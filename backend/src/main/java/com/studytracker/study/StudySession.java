package com.studytracker.study;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
@Getter
@Setter
@NoArgsConstructor
public class StudySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;
    @Column(name = "start_time", columnDefinition = "DATETIME", nullable = false)
    @JsonSerialize(using = LocalDateTimeToBeijingSerializer.class)
    private LocalDateTime startTime;
    @Column(name = "end_time", columnDefinition = "DATETIME", nullable = false)
    @JsonSerialize(using = LocalDateTimeToBeijingSerializer.class)
    private LocalDateTime endTime;
    private String note;
    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
    
}







