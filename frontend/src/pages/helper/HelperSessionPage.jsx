import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import styles from './HelperSessionPage.module.css';

const initialMessages = [
  { id: 1, from: 'seeker', text: "It's been a tough week at work, feeling a bit overwhelmed.", time: '10:10 AM' },
];

const BRIEF = {
  anonId: 'Anon #4821',
  urgency: 'High Urgency',
  tags: ['Work Stress', 'Anxiety'],
  summary: '"Feeling overwhelmed with work stress and sudden anxiety peaks during meetings."',
  needs: [
    {
      title: 'Immediate grounding techniques',
      text: 'Provide actionable exercises for acute anxiety during high-pressure work scenarios.',
    },
    {
      title: 'Professional validation',
      text: 'Acknowledge and validate the validity of their work-related stressors as real clinical factors.',
    },
    {
      title: 'Safe decompression space',
      text: 'Establish a non-judgmental environment where they can vent without fear of professional repercussions.',
    },
  ],
  warning: 'Escalate if you detect crisis signals or self-harm ideation during the discourse.',
  approach:
    'Based on the keywords "Overwhelmed" and "Meetings", consider beginning with a 2-minute breathing anchor to settle the physiological baseline before deep-diving into work triggers.',
};

function BriefDrawer({ onClose }) {
  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerUrgency}>
              <span className={styles.urgencyDot} />
              <span className={styles.urgencyLabel}>{BRIEF.urgency}</span>
            </div>
            <h3 className={styles.drawerTitle}>Request Brief — {BRIEF.anonId}</h3>
            <div className={styles.drawerTags}>
              {BRIEF.tags.map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
          <button className={styles.drawerClose} onClick={onClose}>✕</button>
        </div>

        {/* Drawer Body */}
        <div className={styles.drawerBody}>
          {/* Patient Summary */}
          <div className={styles.briefSection}>
            <p className={styles.sectionLabel}>Patient Summary</p>
            <p className={styles.summaryQuote}>{BRIEF.summary}</p>
          </div>

          {/* What they need */}
          <div className={styles.briefSection}>
            <div className={styles.needsHeader}>
              <span className={styles.needsIcon}>🧠</span>
              <p className={styles.sectionLabel} style={{ margin: 0 }}>What this person needs</p>
            </div>
            <div className={styles.needsList}>
              {BRIEF.needs.map((need, i) => (
                <div key={i} className={styles.needItem}>
                  <div className={styles.needNumber}>{i + 1}</div>
                  <div>
                    <p className={styles.needItemTitle}>{need.title}</p>
                    <p className={styles.needItemText}>{need.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className={styles.warningBanner}>
            <div className={styles.warningIcon}>⚠</div>
            <div>
              <p className={styles.warningTitle}>Critical Clinical Reminder</p>
              <p className={styles.warningText}>{BRIEF.warning}</p>
            </div>
          </div>

          {/* Suggested Approach */}
          <div className={styles.approachCard}>
            <p className={styles.approachLabel}>Suggested Approach</p>
            <p className={styles.approachText}>{BRIEF.approach}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HelperSessionPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'helper', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInput('');
  };

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Top bar */}
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/helper/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className={styles.topBar}>
            <div className={styles.sessionInfo}>
              <div className={styles.seekerDot} />
              <div>
                <p className={styles.sessionTitle}>Session with Anon #4821</p>
                <p className={styles.sessionTags}>Work Stress · Anxiety</p>
              </div>
            </div>
            <div className={styles.topBarActions}>
              <button
                className={styles.infoBtn}
                onClick={() => setBriefOpen(true)}
                title="View request brief"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button className={styles.endBtn} onClick={() => navigate('/helper/dashboard')}>
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className={styles.chatArea}>
          <div className={styles.dateSep}>TODAY</div>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={[styles.msgRow, msg.from === 'helper' ? styles.helperRow : styles.seekerRow].join(' ')}
            >
              {msg.from === 'seeker' && <div className={styles.seekerAvatar}>A</div>}
              <div className={[styles.bubble, msg.from === 'helper' ? styles.helperBubble : styles.seekerBubble].join(' ')}>
                <p>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
              {msg.from === 'helper' && <div className={styles.helperAvatar}>H</div>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className={styles.inputBar}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a supportive message..."
          />
          <button
            className={[styles.sendBtn, !input.trim() ? styles.sendBtnDisabled : ''].join(' ')}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Brief drawer */}
      {briefOpen && <BriefDrawer onClose={() => setBriefOpen(false)} />}
    </AppLayout>
  );
}
