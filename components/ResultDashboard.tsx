"use client";

import { useState, useEffect, useRef } from "react";
import { InputForm, type FormValues } from "./InputForm";
import { ResultTable } from "./ResultTable";
import { trpc, setApiToken } from "@/trpc/client";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

interface ResultDashboardProps {
  title: string;
  subtitle?: string;
}

export function ResultDashboard({ title, subtitle }: ResultDashboardProps) {
  const [lastQuery, setLastQuery] = useState<FormValues | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Legal Modals State
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Mercury Blobs Data
  const [blobsData, setBlobsData] = useState<Array<{ size: number; left: number; top: number; animationDelay: number; animationDuration: number }>>([]);

  useEffect(() => {
    setBlobsData(Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 200 + 150,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    })));
  }, []);

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 20;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { data: tokenData } = trpc.result.getToken.useQuery(undefined, {
    refetchInterval: 4 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (tokenData?.token) {
      setApiToken(tokenData.token);
    }
  }, [tokenData]);

  const { data, error, isPending, mutate } = trpc.result.getResults.useMutation();

  const handleSubmit = (values: FormValues) => {
    setLastQuery(values);
    mutate({
      username: values.username,
      password: values.password,
      semesterId: values.semesterId,
    });
  };

  const courses = data?.courses ?? [];

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const width = exportRef.current.offsetWidth;
      const height = exportRef.current.offsetHeight;
      const dataUrl = await htmlToImage.toPng(exportRef.current, { quality: 1.0, pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`KTU_Result_${lastQuery?.username || "Export"}.pdf`);
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mercury-wrapper">
      <svg className="svg-filter-hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      <div className="stage" id="stage">
        {blobsData.map((data, index) => (
          <div
            key={index}
            ref={(el) => { blobRefs.current[index] = el; }}
            className="blob"
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              left: `${data.left}%`,
              top: `${data.top}%`,
              animationDelay: `${data.animationDelay}s`,
              animationDuration: `${data.animationDuration}s`,
            }}
          />
        ))}
      </div>

      <main className={`auth-container ${lastQuery ? 'has-results' : ''}`}>
        
        {/* Left Side: Always visible Form */}
        <div className="auth-form-side">
          <header className="header">
            <h1>ACADEMIX<br/>KTU</h1>
          </header>

          <InputForm onSubmit={handleSubmit} isLoading={isPending} />

          {error && (
            <div style={{ marginTop: '20px', padding: '15px', borderLeft: '2px solid red', background: 'rgba(255,0,0,0.1)', fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#ff4444' }}>
              [ERR_ACCESS_DENIED]: {error.message}
            </div>
          )}

          <footer className="footer-nav">
            <a href="https://ktu.edu.in/" target="_blank" rel="noreferrer">KTU WEBSITE</a>
            <a href="https://app.ktu.edu.in/" target="_blank" rel="noreferrer">STUDENT PORTAL</a>
          </footer>
        </div>

        {/* Right Side: Results Table (Animates in when lastQuery exists) */}
        {lastQuery && (
          <div className="animate-fade-in-up auth-results-side result-export-container" ref={exportRef} style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', background: 'var(--bg)', padding: '20px', borderRadius: '12px' }}>
            <header className="header" data-html2canvas-ignore style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="brand-id">Student ID: {lastQuery.username}</span>
                <h1 style={{ fontSize: '2rem' }}>
                  {lastQuery.semesterId === 0 ? 'ALL' : 'SEMESTER'}<br/>
                  {lastQuery.semesterId === 0 ? 'SEMESTERS' : lastQuery.semesterId}
                </h1>
              </div>
              <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'var(--accent)', 
                    fontFamily: "'Space Mono', monospace", 
                    fontSize: '12px', 
                    letterSpacing: '2px',
                    cursor: isExporting ? 'not-allowed' : 'pointer', 
                    padding: '10px 20px',
                    borderRadius: '0',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isExporting ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <Download size={14} />
                  {isExporting ? "EXPORTING..." : "SAVE PDF"}
                </button>
                <button 
                  onClick={() => setLastQuery(null)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'var(--accent)', 
                    fontFamily: "'Space Mono', monospace", 
                    fontSize: '12px', 
                    letterSpacing: '2px',
                    cursor: 'pointer', 
                    padding: '10px 20px',
                    borderRadius: '0',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  &times; CLEAR
                </button>
              </div>
            </header>
            
            <ResultTable
              courses={courses}
              semesterId={lastQuery.semesterId}
              isLoading={isPending}
              studentDetails={data?.studentDetails}
              trendData={data?.trendData}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="footer-main">
        <div>© 2026 Academix KTU. All rights reserved.</div>
        <div className="divider" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
        <button onClick={() => setIsPrivacyOpen(true)} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          PRIVACY POLICY
        </button>
        <div className="divider" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
        <button onClick={() => setIsTermsOpen(true)} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          TERMS OF SERVICE
        </button>
        <div className="divider" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
        <a href="https://anandhakrishnan-portfolio.vercel.app/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          CONTACT DEVELOPER
        </a>
      </footer>

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', maxWidth: '600px', width: '90%', borderRadius: '16px', position: 'relative' }}>
            <button onClick={() => setIsPrivacyOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontFamily: "'Space Mono', monospace", color: '#00ff55', fontSize: '18px', marginBottom: '20px' }}>🔒 PRIVACY POLICY & DATA SECURITY</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '15px' }}>Your privacy and data security are our absolute priority. By using this tool, you acknowledge the following:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '15px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Zero Data Retention:</strong> Your KTU credentials (username and password) are sent directly to the official KTU servers via a secure proxy. We do not store, log, or save your password in any database.</li>
                <li style={{ marginBottom: '8px' }}><strong>No Tracking:</strong> We do not track individual users or harvest scraped results. Data is processed in real-time and immediately discarded after rendering your dashboard.</li>
                <li style={{ marginBottom: '8px' }}><strong>Session Management:</strong> Any tokens or cookies generated during the login process are temporary and managed securely by your own browser.</li>
              </ul>
              <p>This tool is designed purely for the convenience of formatting publicly accessible academic data into a readable dashboard.</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {isTermsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', maxWidth: '600px', width: '90%', borderRadius: '16px', position: 'relative' }}>
            <button onClick={() => setIsTermsOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontFamily: "'Space Mono', monospace", color: 'var(--text-primary)', fontSize: '18px', marginBottom: '20px' }}>⚖️ TERMS OF SERVICE</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '15px' }}>This tool is provided "as is", without warranty of any kind.</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '15px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Unofficial Status:</strong> This is an unofficial, open-source tool built by students, for students. It is NOT affiliated with, endorsed by, or connected to APJ Abdul Kalam Technological University (KTU) in any capacity.</li>
                <li style={{ marginBottom: '8px' }}><strong>Accuracy of Data:</strong> While we strive to parse results accurately, we cannot guarantee 100% precision. Always refer to the official KTU portal for your verified, authoritative academic records.</li>
                <li style={{ marginBottom: '8px' }}><strong>Liability:</strong> The creators of this platform hold no liability for service interruptions, server blocks, or any academic decisions made based on the data displayed here.</li>
              </ul>
              <p>By using this platform, you agree to these terms and acknowledge its unofficial nature.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
