'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { CourseEnrollmentsDB, CoursesDB } from '@/lib/database';
import { CourseEnrollment, CourseRecord } from '@/lib/types';
import styles from './myCourses.module.css';

type FilterTab = 'active' | 'completed' | 'abandoned';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseRecord>>({});
  const [filterTab, setFilterTab] = useState<FilterTab>('active');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load enrollments from localStorage
    const allEnrollments = CourseEnrollmentsDB.getAll();
    setEnrollments(allEnrollments);

    // Load all courses
    const allCourses = CoursesDB.getAll();
    const courseMap: Record<string, CourseRecord> = {};
    allCourses.forEach((course) => {
      courseMap[course.id] = course;
    });
    setCourses(courseMap);

    setIsLoaded(true);
  }, []);

  const filteredEnrollments = enrollments.filter((e) => e.status === filterTab);

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.header}>
        <div className={styles.container}>
          <span className="section-label">📚 Mis Cursos</span>
          <h1>Tus Cursos Comprados</h1>
          <p className={styles.subtitle}>
            Accede a todos tus cursos y continúa tu aprendizaje
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${filterTab === 'active' ? styles.tabActive : ''}`}
            onClick={() => setFilterTab('active')}
          >
            📖 Activos ({enrollments.filter((e) => e.status === 'active').length})
          </button>
          <button
            className={`${styles.tab} ${filterTab === 'completed' ? styles.tabActive : ''}`}
            onClick={() => setFilterTab('completed')}
          >
            ✅ Completados ({enrollments.filter((e) => e.status === 'completed').length})
          </button>
          <button
            className={`${styles.tab} ${filterTab === 'abandoned' ? styles.tabActive : ''}`}
            onClick={() => setFilterTab('abandoned')}
          >
            ⏸️ Abandonados ({enrollments.filter((e) => e.status === 'abandoned').length})
          </button>
        </div>

        {/* Courses Grid */}
        {isLoaded && filteredEnrollments.length > 0 ? (
          <div className={styles.grid}>
            {filteredEnrollments.map((enrollment) => {
              const course = courses[enrollment.courseId];
              if (!course) return null;

              const progressPercent = Math.round(enrollment.progress);
              const hoursSpent = Math.floor(Math.random() * 30) + 1; // Demo: random hours

              return (
                <div key={enrollment.id} className={styles.courseCard}>
                  {/* Course image */}
                  <div className={styles.courseImage}>
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #1B3A6B, #2D5AA0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '3rem',
                        }}
                      >
                        📚
                      </div>
                    )}
                  </div>

                  {/* Course info */}
                  <div className={styles.courseInfo}>
                    <div className={styles.careerBadge}>{course.careerPath}</div>
                    <h3 className={styles.courseTitle}>{course.title}</h3>

                    {/* Meta */}
                    <div className={styles.meta}>
                      <span>📊 Nivel: {course.level}</span>
                      <span>⏱️ {course.duration} minutos</span>
                    </div>

                    {/* Progress bar */}
                    <div className={styles.progressSection}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>{progressPercent}%</span>
                    </div>

                    {/* Time spent */}
                    <div className={styles.timeSpent}>
                      ⏳ {hoursSpent}h invertidas
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                      {filterTab === 'completed' ? (
                        <>
                          <button className={styles.btnPrimary}>
                            🎓 Ver Certificado
                          </button>
                          <button className={styles.btnSecondary}>Repasar</button>
                        </>
                      ) : (
                        <>
                          <button className={styles.btnPrimary}>
                            ▶️ Continuar
                          </button>
                          <button className={styles.btnSecondary}>
                            Pausar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isLoaded && filteredEnrollments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No tienes cursos en esta categoría</h2>
            <p>
              {filterTab === 'completed'
                ? 'Completa un curso para ver tu certificado aquí'
                : 'Comienza tu aprendizaje explorando nuestro catálogo'}
            </p>
            <Link href="/academy" className={styles.btnLink}>
              🎓 Explorar Cursos
            </Link>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Cargando tus cursos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
