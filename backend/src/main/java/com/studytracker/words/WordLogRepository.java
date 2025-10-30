package com.studytracker.words;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WordLogRepository extends JpaRepository<WordLog, Long> {
    List<WordLog> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate from, LocalDate to);
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM WordLog w WHERE w.subjectId = :subjectId")
    void deleteBySubjectId(@Param("subjectId") Long subjectId);
}






