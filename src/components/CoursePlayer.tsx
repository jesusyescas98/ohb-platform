'use client';

import { useState, useEffect } from 'react';
import styles from './CoursePlayer.module.css';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  contentMarkdown?: string;
}

interface CoursePlayerProps {
  courseName: string;
  lessons: Lesson[];
  enrollmentId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export default function CoursePlayer({
  courseName,
  lessons,
  enrollmentId,
  onComplete,
  onClose,
}: CoursePlayerProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentLesson = lessons[currentLessonIndex];
  const progressPercent = Math.round((completedLessons.length / lessons.length) * 100);
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isLessonCompleted = completedLessons.includes(currentLesson.id);

  useEffect(() => {
    // Save progress to localStorage
    const progressData = {
      enrollmentId,
      completedLessons,
      totalTimeSpent,
      lastAccessedAt: Date.now(),
    };
    localStorage.setItem(`course_progress_${enrollmentId}`, JSON.stringify(progressData));
  }, [completedLessons, totalTimeSpent, enrollmentId]);

  useEffect(() => {
    // Track time spent
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    }
  };

  const handleNextLesson = () => {
    if (!isLastLesson) {
      handleMarkComplete();
      setCurrentLessonIndex(currentLessonIndex + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleCourseComplete = () => {
    handleMarkComplete();
    if (onComplete) {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.playerContainer}>
      {/* Header with title and close button */}
      <div className={styles.header}>
        <h1 className={styles.courseTitle}>{courseName}</h1>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Main player area */}
      <div className={styles.mainContent}>
        {/* Video player section */}
        <div className={styles.videoSection}>
          {currentLesson.videoUrl ? (
            <video
              src={currentLesson.videoUrl}
              controls
              className={styles.video}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              🎥 Video no disponible
            </div>
          )}

          <div className={styles.lessonInfo}>
            <h2>{currentLesson.title}</h2>
            <p className={styles.duration}>⏱️ Duración: {currentLesson.duration} minutos</p>
          </div>

          {currentLesson.contentMarkdown && (
            <div className={styles.content}>
              <p>{currentLesson.contentMarkdown}</p>
            </div>
          )}

          {/* Lesson actions */}
          <div className={styles.lessonActions}>
            {!isLessonCompleted && (
              <button className={styles.btnMark} onClick={handleMarkComplete}>
                ✓ Marcar como Completada
              </button>
            )}
            {isLessonCompleted && (
              <span className={styles.completed}>✓ Completada</span>
            )}
          </div>
        </div>

        {/* Sidebar with lessons list */}
        <aside className={styles.sidebar}>
          <div className={styles.progressSection}>
            <h3>Progreso</h3>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className={styles.progressText}>{progressPercent}% completado</p>
            <p className={styles.timeSpent}>⏳ {formatTime(totalTimeSpent)} invertidas</p>
          </div>

          <div className={styles.lessonsList}>
            <h3>Lecciones</h3>
            {lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                className={`${styles.lessonItem} ${
                  index === currentLessonIndex ? styles.active : ''
                } ${completedLessons.includes(lesson.id) ? styles.completed : ''}`}
                onClick={() => setCurrentLessonIndex(index)}
              >
                <span className={styles.lessonIndex}>
                  {completedLessons.includes(lesson.id) ? '✓' : index + 1}
                </span>
                <span className={styles.lessonTitle}>{lesson.title}</span>
                <span className={styles.lessonDuration}>{lesson.duration}m</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Navigation buttons */}
      <div className={styles.footer}>
        <button
          className={styles.btnNav}
          onClick={handlePrevLesson}
          disabled={currentLessonIndex === 0}
        >
          ← Lección Anterior
        </button>

        <div className={styles.footerCenter}>
          {isLastLesson && isLessonCompleted && (
            <button className={styles.btnComplete} onClick={handleCourseComplete}>
              🎓 Finalizar Curso
            </button>
          )}
          {!isLastLesson && (
            <span className={styles.lessonCounter}>
              Lección {currentLessonIndex + 1} de {lessons.length}
            </span>
          )}
        </div>

        <button
          className={styles.btnNav}
          onClick={handleNextLesson}
          disabled={isLastLesson}
        >
          Siguiente Lección →
        </button>
      </div>
    </div>
  );
}
