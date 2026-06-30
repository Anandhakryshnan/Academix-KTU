"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export interface FormValues {
  username: string;
  password: string;
  semesterId: number;
}

interface InputFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [semesterId, setSemesterId] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    onSubmit({
      username: username.trim(),
      password: password.trim(),
      semesterId,
    });
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Register Number</label>
        <input 
          type="text" 
          placeholder="e.g. LIDK21CS074" 
          required 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="input-glow"></div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="input-glow"></div>
      </div>

      <div className="form-group" style={{ marginBottom: '10px' }}>
        <label>Select Semester</label>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {SEMESTERS.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSemesterId(sem)}
              style={{
                background: 'transparent',
                border: semesterId === sem ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                color: semesterId === sem ? 'var(--accent)' : 'var(--text-dim)',
                padding: '10px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              S{sem}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSemesterId(0)}
            style={{
              gridColumn: '1 / -1',
              background: 'transparent',
              border: semesterId === 0 ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
              color: semesterId === 0 ? 'var(--accent)' : 'var(--text-dim)',
              padding: '10px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ALL SEMESTERS
          </button>
        </div>
      </div>

      <div className="submit-wrap">
        <div className="mercury-drop"></div>
        <button 
          type="submit" 
          className="btn-base" 
          disabled={isLoading || !username.trim() || !password.trim()}
        >
          {isLoading ? (
             <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                FETCHING DATA...
             </span>
          ) : (
            'Get Results'
          )}
        </button>
      </div>
    </form>
  );
}