"use client";

import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export interface CourseResult {
  courseCode: string;
  courseName: string;
  credit: string;
  grade: string;
}

interface ResultTableProps {
  courses: CourseResult[];
  semesterId: number;
  isLoading: boolean;
  cgpa?: number;
  studentDetails?: {
    name: string;
    registerNo: string;
    college: string;
    branch: string;
  };
  trendData?: { semester: string; sgpa: number }[];
}

const GRADE_POINTS: Record<string, number> = {
  S: 10, "A+": 9, A: 8.5, "B+": 8, B: 7.5,
  "C+": 7, C: 6.5, D: 6, P: 5.5, F: 0, FE: 0, AB: 0,
};

const GRADE_COLORS: Record<string, string> = {
  "S": "#00ffff", // Glowing Cyan
  "A+": "#00ff55", // Bright Green
  "A": "#39ff14", // Vibrant Green
  "B+": "#88ff00", // Vibrant Lime
  "B": "#bbff00", // Yellow-Green
  "C+": "#ffee00", // Warning Yellow
  "C": "#ffcc00", // Golden Yellow
  "D": "#ff8800", // Alert Orange
  "P": "#ff6600", // Deep Orange
  "F": "#ff0000", // Critical Pure Red
  "FE": "#ff0000",
  "AB": "#ff0000",
};

function calculateSGPA(courses: CourseResult[]) {
  let totalCredits = 0;
  let weightedPoints = 0;

  courses.forEach((course) => {
    const credit = parseFloat(course.credit) || 0;
    const gradePoint = GRADE_POINTS[course.grade.toUpperCase()] ?? 0;
    totalCredits += credit;
    weightedPoints += credit * gradePoint;
  });

  if (totalCredits === 0) return 0;
  return weightedPoints / totalCredits;
}

const SkeletonTable = () => (
  <div style={{ marginTop: '20px', width: '100%', animation: 'fade-in 0.5s' }}>
    <div style={{ padding: '20px', border: '1px solid var(--border-dim)', background: 'var(--glass-bg)', marginBottom: '30px' }}>
      <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '20px' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
        <div className="skeleton-box" style={{ width: '100%', height: '80px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', height: '80px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', height: '80px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', height: '80px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', height: '80px' }}></div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="skeleton-box" style={{ width: '200px', height: '24px' }}></div>
      <div className="skeleton-box" style={{ width: '100px', height: '36px' }}></div>
    </div>
    
    <div style={{ border: '1px solid var(--border-dim)', background: 'var(--glass-bg)' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ 
          display: 'flex', 
          padding: '15px 20px',
          borderBottom: i !== 5 ? '1px solid var(--border-dim)' : 'none',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div className="skeleton-box" style={{ width: '10%', height: '14px' }}></div>
          <div className="skeleton-box" style={{ width: '50%', height: '14px' }}></div>
          <div className="skeleton-box" style={{ width: '8%', height: '14px' }}></div>
          <div className="skeleton-box" style={{ width: '8%', height: '20px' }}></div>
        </div>
      ))}
    </div>
  </div>
);

const Student3DCard = ({ details }: { details: { name: string; registerNo: string; college: string; branch: string; } }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="card-3d-container" style={{ perspective: '1000px' }}>
      <div 
        ref={cardRef}
        className="card-3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
          padding: '30px', 
          border: '1px solid var(--border-dim)', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderRadius: '16px'
        }}
      >
        <div className="card-glare" style={{ 
          backgroundPosition: `${50 + tilt.y * 2}% ${50 - tilt.x * 2}%`,
          opacity: tilt.x === 0 && tilt.y === 0 ? 0 : 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>ACADEMIX ID</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{details.name}</div>
          <div style={{ fontSize: '14px', color: 'var(--accent)', fontFamily: "'Space Mono', monospace", background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>{details.registerNo}</div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative', zIndex: 20 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px', maxWidth: '300px' }}>{details.college}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace" }}>{details.branch}</div>
        </div>
      </div>
    </div>
  );
};

export function ResultTable({
  courses,
  semesterId,
  isLoading,
  cgpa,
  studentDetails,
  trendData,
}: ResultTableProps) {
  const totalCredits = courses.reduce(
    (sum, c) => sum + (parseFloat(c.credit) || 0),
    0
  );
  
  const totalCourses = courses.length;
  const passedCourses = courses.filter(
    (c) => !["F", "FE", "AB"].includes(c.grade.toUpperCase())
  ).length;
  const failedCoursesList = courses.filter(
    (c) => ["F", "FE", "AB"].includes(c.grade.toUpperCase())
  );
  const failedCourses = failedCoursesList.length;

  const failedCredits = failedCoursesList.reduce(
    (sum, c) => sum + (parseFloat(c.credit) || 0),
    0
  );

  const sgpa = calculateSGPA(courses);

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (courses.length === 0) {
    return (
      <div style={{ padding: '60px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', textAlign: 'center', fontFamily: "'Space Mono', monospace" }}>
        <h3 style={{ color: 'var(--accent)', fontSize: '20px', marginBottom: '10px' }}>[NO_RECORDS_FOUND]</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>No results published for Semester {semesterId}.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>

      {/* Student 3D ID Header */}
      {studentDetails && studentDetails.name && (
        <Student3DCard details={studentDetails} />
      )}

      {/* Trend Graph (Visible only in All Semesters) */}
      {trendData && trendData.length > 0 && (
        <div style={{ padding: '30px 20px', border: '1px solid var(--border-dim)', background: 'var(--glass-bg)', marginBottom: '30px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '20px' }}>SGPA TRAJECTORY</div>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-dim)" vertical={false} />
                <XAxis dataKey="semester" stroke="var(--text-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="var(--text-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--glass-bg-solid)', border: '1px solid var(--accent)', borderRadius: '0', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <ReferenceLine y={sgpa} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'AVG', fill: 'var(--text-dim)', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="sgpa" 
                  stroke="var(--accent)" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: 'var(--bg-base)', stroke: 'var(--accent)', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-base)' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cgpa !== undefined ? 6 : 5}, 1fr)`, gap: '15px', marginBottom: '30px' }}>
        {sgpa !== undefined && (
          <div style={{ padding: '20px', borderBottom: '2px solid var(--mercury)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>
               {semesterId === 0 ? 'OVERALL CGPA' : 'SGPA'}
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{Number(sgpa).toFixed(2)}</div>
          </div>
        )}
        
        {cgpa !== undefined && (
          <div style={{ padding: '20px', borderBottom: '2px solid var(--mercury-dark)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>CGPA</div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{cgpa.toFixed(2)}</div>
          </div>
        )}

        <div style={{ padding: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>TOTAL COURSES</div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{totalCourses}</div>
        </div>

        <div style={{ padding: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>PASSED COURSES</div>
             <div style={{ fontSize: '32px', fontWeight: 800, color: passedCourses === totalCourses ? '#00ff55' : 'inherit' }}>{passedCourses}</div>
        </div>

        <div style={{ padding: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>FAILED COURSES</div>
             <div style={{ fontSize: '32px', fontWeight: 800, color: failedCourses > 0 ? '#ff0000' : 'inherit' }}>{failedCourses}</div>
        </div>

        <div style={{ padding: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>TOTAL CREDITS</div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{totalCredits}</div>
        </div>
      </div>

      {/* DANGER ZONE - BACKLOG BOARD */}
      {failedCoursesList.length > 0 && (
        <div style={{ marginBottom: '30px', border: '1px solid #ff0000', background: 'rgba(255,0,0,0.05)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', background: 'rgba(255,0,0,0.1)', borderBottom: '1px solid rgba(255,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#ff0000', letterSpacing: '2px', fontWeight: 'bold' }}>
              ⚠️ DANGER ZONE: PENDING BACKLOGS
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#ffaaaa' }}>
              TOTAL PENDING CREDITS: <span style={{ color: '#ff0000', fontWeight: 'bold', fontSize: '12px' }}>{failedCredits}</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="kt-table">
              <tbody>
              {failedCoursesList.map((course, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,0,0,0.1)' }}>
                  <td style={{ fontFamily: "'Space Mono', monospace", color: '#ffaaaa' }}>
                    {course.courseCode}
                  </td>
                  <td className="course-name" style={{ fontWeight: 400, color: '#ff5555' }}>
                    {course.courseName}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: "'Space Mono', monospace", color: '#ffaaaa' }}>
                    {course.credit} CR
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="grade-badge" style={{ 
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 'bold',
                      color: '#ff0000',
                      background: 'rgba(255,0,0,0.1)'
                    }}>
                      {course.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Data Table */}
      <div style={{ border: '1px solid var(--border-dim)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', overflowX: 'auto', width: '100%' }}>
        <table className="kt-table">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-dim)', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)' }}>
              <th style={{ fontWeight: 'normal' }}>COURSE CODE</th>
              <th style={{ fontWeight: 'normal' }}>COURSE NAME</th>
              <th style={{ fontWeight: 'normal', textAlign: 'center' }}>CREDITS</th>
              <th style={{ fontWeight: 'normal', textAlign: 'right' }}>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--surface-dim)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-dim)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ fontFamily: "'Space Mono', monospace", color: 'var(--text-dim)' }}>
                  {course.courseCode}
                </td>
                <td className="course-name" style={{ fontWeight: 300, color: 'var(--accent)' }}>
                  {course.courseName}
                </td>
                <td style={{ textAlign: 'center', fontFamily: "'Space Mono', monospace" }}>
                  {course.credit}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="grade-badge" style={{ 
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 'bold',
                    color: GRADE_COLORS[course.grade] || 'var(--accent)'
                  }}>
                    {course.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



    </div>
  );
}
