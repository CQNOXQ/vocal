package com.studytracker.study;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(Long userId, LocalDateTime from, LocalDateTime to);
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM StudySession s WHERE s.subjectId = :subjectId")
    void deleteBySubjectId(@Param("subjectId") Long subjectId);
}






