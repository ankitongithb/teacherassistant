-- Teacher Assistant Database Schema
-- Run this manually if you prefer manual setup over JPA auto-DDL

CREATE DATABASE IF NOT EXISTS teacher_assistant;
USE teacher_assistant;

-- Teacher table
CREATE TABLE IF NOT EXISTS teacher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    college_name VARCHAR(200),
    department VARCHAR(100),
    role ENUM('TEACHER','ADMIN') DEFAULT 'TEACHER',
    profile_completed BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher_email (email),
    INDEX idx_teacher_deleted (is_deleted)
);

-- Subject table
CREATE TABLE IF NOT EXISTS subject (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    teacher_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    INDEX idx_subject_code (subject_code),
    INDEX idx_subject_teacher (teacher_id)
);

-- Batch table
CREATE TABLE IF NOT EXISTS batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(100) NOT NULL,
    teacher_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    INDEX idx_batch_teacher (teacher_id)
);

-- Batch-Subject mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS batch_subject (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    UNIQUE KEY uk_batch_subject (batch_id, subject_id),
    FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE
);

-- Student table
CREATE TABLE IF NOT EXISTS student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    batch_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE,
    INDEX idx_student_batch (batch_id),
    INDEX idx_student_roll (roll_number)
);

-- Attendance Session table
CREATE TABLE IF NOT EXISTS attendance_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    hours INT NOT NULL DEFAULT 1,
    topic VARCHAR(200),
    subject_id BIGINT NOT NULL,
    batch_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    INDEX idx_session_date (date),
    INDEX idx_session_batch_subject (batch_id, subject_id)
);

-- Attendance Record table
CREATE TABLE IF NOT EXISTS attendance_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('PRESENT','ABSENT') NOT NULL,
    UNIQUE KEY uk_session_student (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_session(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    INDEX idx_record_student (student_id)
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    exam_type ENUM('INTERNAL','MID','FINAL') NOT NULL,
    marks_obtained DOUBLE NOT NULL,
    total_marks DOUBLE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    INDEX idx_marks_student (student_id),
    INDEX idx_marks_subject (subject_id),
    INDEX idx_marks_exam_type (exam_type)
);
