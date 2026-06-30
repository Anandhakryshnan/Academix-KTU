"use client";

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
    return (
      <div style={{ padding: '60px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', textAlign: 'center', fontFamily: "'Space Mono', monospace" }}>
        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 20px', color: 'var(--mercury)' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: '12px', letterSpacing: '4px' }}>RETRIEVING RESULTS...</p>
      </div>
    );
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

      {/* Student ID Header */}
      {studentDetails && studentDetails.name && (
        <div style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>STUDENT PROFILE</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{studentDetails.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--accent)', fontFamily: "'Space Mono', monospace" }}>{studentDetails.registerNo}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px', maxWidth: '300px' }}>{studentDetails.college}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace" }}>{studentDetails.branch}</div>
          </div>
        </div>
      )}

      {/* Trend Graph (Visible only in All Semesters) */}
      {trendData && trendData.length > 0 && (
        <div style={{ padding: '30px 20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', marginBottom: '30px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '20px' }}>SGPA TRAJECTORY</div>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="semester" stroke="var(--text-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="var(--text-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent)', borderRadius: '0', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
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
      <div style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', overflowX: 'auto', width: '100%' }}>
        <table className="kt-table">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-dim)' }}>
              <th style={{ fontWeight: 'normal' }}>COURSE CODE</th>
              <th style={{ fontWeight: 'normal' }}>COURSE NAME</th>
              <th style={{ fontWeight: 'normal', textAlign: 'center' }}>CREDITS</th>
              <th style={{ fontWeight: 'normal', textAlign: 'right' }}>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
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