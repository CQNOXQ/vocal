package com.studytracker.subject;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String name;
    @Column(name = "color_hex")
    private String colorHex;
    @Column(name = "is_archived")
    private Boolean archived = false;
    @Column(name = "study_type")
    private String studyType = "MINUTES"; // MINUTES or WORDS
    @Column(name = "daily_target")
    private Integer dailyTarget = 0;
    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}




