import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import styles from './ProfessionalSupportPage.module.css';

const CATEGORIES = [
  { label: 'Anxiety', icon: '🌀' },
  { label: 'Work Stress', icon: '💼' },
  { label: 'Relationships', icon: '❤️' },
  { label: 'Sleep', icon: '🌙' },
  { label: 'Grief', icon: '🕊️' },
  { label: 'Career', icon: '🎯' },
  { label: 'Self-esteem', icon: '🌱' },
  { label: 'Other', icon: '💬' },
];

const MOCK_RESPONSES = [
  {
    id: 'resp1',
    initials: 'DA',
    name: 'Dr. Aris',
    role: 'Verified Therapist',
    time: '2m ago',
    message: "I understand how overwhelming this can feel. I'm available right now — happy to chat or jump straight into a session.",
    sessionId: 's-aris',
  },
  {
    id: 'resp2',
    initials: 'MK',
    name: 'Peer Helper',
    role: 'Peer Supporter',
    time: '5m ago',
    message: "I've been through something similar. Happy to share what helped me or just listen — whatever feels right for you.",
    sessionId: 's-mk',
  },
];

function ResponseCard({ resp, onSession }) {
  return (
    <div className={styles.responseCard}>
      <div className={styles.respHeader}>
        <div className={styles.respAvatar}>{resp.initials}</div>
        <div className={styles.respMeta}>
          <span className={styles.respName}>{resp.name}</span>
          <span className={styles.respRole}>{resp.role}</span>
        </div>
        <span className={styles.respTime}>{resp.time}</span>
      </div>
      <p className={styles.respMessage}>{resp.message}</p>
      <button className={styles.sessionBtn} onClick={() => onSession(resp.sessionId)}>
        ▶ Open Session
      </button>
    </div>
  );
}

function RequestItem({ req, onSession }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={styles.requestItem}>
      <div className={styles.requestItemHeader} onClick={() => setExpanded(p => !p)}>
        <div className={styles.requestItemLeft}>
          <span className={[styles.typePill, req.helperType === 'therapist' ? styles.typePillTherapist : ''].join(' ')}>
            {req.helperType === 'peer' ? '🤝 Peer' : '🩺 Therapist'}
          </span>
          <div className={styles.requestItemMeta}>
            <p className={styles.requestItemMessage}>"{req.message}"</p>
            <div className={styles.requestItemCategories}>
              {req.categories.map(c => <span key={c} className={styles.reqCatChip}>{c}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.requestItemRight}>
          <span className={styles.requestItemTime}>{req.time}</span>
          <span className={styles.responsesCount}>{req.responses.length} response{req.responses.length !== 1 ? 's' : ''}</span>
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.responseGrid}>
          {req.responses.map(resp => (
            <ResponseCard key={resp.id} resp={resp} onSession={onSession} />
          ))}
          {req.responses.length === 0 && (
            <p className={styles.waitingText}>⏳ Waiting for helpers to respond...</p>
          )}
        </div>
      )}
    </div>
  );
}

function ComposeForm({ onSend, isDrawer }) {
  const [helperType, setHelperType] = useState('peer');
  const [message, setMessage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (label) =>
    setSelectedCategories(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );

  const handleSend = () => {
    if (!message.trim()) return;
    onSend({ helperType, message, categories: selectedCategories });
  };

  return (
    <div className={[styles.composeForm, isDrawer ? styles.composeFormDrawer : ''].join(' ')}>
      {!isDrawer && (
        <div className={styles.formIntro}>
          <h2 className={styles.formTitle}>How can we help you today?</h2>
          <p className={styles.formSub}>Share what's on your mind — you're safe here.</p>
        </div>
      )}

      <div className={styles.privacyNote}>
        🔒 Completely anonymous. Helpers only see your non-identifying brief.
      </div>

      {/* Step 1 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>1</span> Who would you like to talk to?
        </div>
        <div className={styles.toggle}>
          <button className={[styles.toggleBtn, helperType === 'peer' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('peer')}>
            🤝 Peer Supporter
          </button>
          <button className={[styles.toggleBtn, helperType === 'therapist' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('therapist')}>
            🩺 Verified Therapist
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>2</span> What area does this relate to?
          <span className={styles.labelHint}> — pick all that apply</span>
        </div>
        <div className={styles.categories}>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={[styles.catChip, selectedCategories.includes(c.label) ? styles.catActive : ''].join(' ')}
              onClick={() => toggleCategory(c.label)}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>3</span> Tell us what's going on
        </div>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="You don't have to have it all figured out. Just share whatever feels right..."
          maxLength={500}
          rows={5}
        />
        <span className={styles.charCount}>{message.length} / 500</span>
      </div>

      <button
        className={[styles.sendBtn, !message.trim() ? styles.sendBtnDisabled : ''].join(' ')}
        onClick={handleSend}
        disabled={!message.trim()}
      >
        Send to Helpers ▶
      </button>
      <div className={styles.responseTime}>⚡ AVERAGE RESPONSE TIME: UNDER 10 MINUTES</div>
    </div>
  );
}

export default function ProfessionalSupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isFirstTime = requests.length === 0;

  const handleSend = ({ helperType, message, categories }) => {
    setRequests(prev => [{
      id: `req-${Date.now()}`,
      helperType,
      message,
      categories,
      time: 'just now',
      responses: MOCK_RESPONSES,
    }, ...prev]);
    setDrawerOpen(false);
  };

  const handleSession = (sessionId) => navigate(`/session/${sessionId}`);

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Get Support" />

      <div className={styles.page}>

        {isFirstTime ? (
          /* ── First time: show form inline ── */
          <div className={styles.firstTimeLayout}>
            <ComposeForm onSend={handleSend} isDrawer={false} />
            <div className={styles.trustSidebar}>
              <p className={styles.previewLabel}>WHY IT'S SAFE</p>
              <div className={styles.trustCard}>
                <div className={styles.trustAvatar} />
                <div>
                  <p className={styles.trustTitle}>Verified Helpers Only</p>
                  <p className={styles.trustDesc}>All peer supporters are trained and verified. Therapists are board-certified professionals.</p>
                </div>
              </div>
              <div className={styles.statsList}>
                <div className={styles.statItem}><span className={styles.statNum}>98%</span><span className={styles.statLabel}>Response rate</span></div>
                <div className={styles.statItem}><span className={styles.statNum}>&lt;10m</span><span className={styles.statLabel}>Avg response time</span></div>
                <div className={styles.statItem}><span className={styles.statNum}>100%</span><span className={styles.statLabel}>Anonymous</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Has requests: list view ── */
          <>
            <div className={styles.listHeader}>
              <div>
                <h2 className={styles.listTitle}>Your Requests</h2>
                <p className={styles.listSub}>{requests.length} request{requests.length !== 1 ? 's' : ''} sent</p>
              </div>
              <button className={styles.newRequestBtn} onClick={() => setDrawerOpen(true)}>
                + New Request
              </button>
            </div>

            <div className={styles.requestList}>
              {requests.map(req => (
                <RequestItem key={req.id} req={req} onSession={handleSession} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Right drawer ── */}
      {drawerOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>New Support Request</h3>
                <p className={styles.drawerSub}>We'll notify available helpers right away.</p>
              </div>
              <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <div className={styles.drawerBody}>
              <ComposeForm onSend={handleSend} isDrawer />
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
