package com.studytracker.goal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "daily_minutes_target")
    private Integer dailyMinutesTarget = 120;
    @Column(name = "daily_words_target")
    private Integer dailyWordsTarget = 50;
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}








