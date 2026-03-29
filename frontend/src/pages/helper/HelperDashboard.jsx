import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getPendingRequests } from '../../api/endpoints';
import styles from './HelperDashboard.module.css';

const activeSessions = [
  { id: 's1', userId: '88219', initials: 'JD', duration: 'Connected for 42m', snippet: '"Thank you for the breathing exercises, I feel a bit more..."' },
  { id: 's2', userId: '77120', initials: 'MK', duration: 'Connected for 1h 15m', snippet: '"I\'ll try to implement the schedule changes this weekend..."' },
  { id: 's3', userId: '90014', initials: 'PL', duration: 'Connected for 5m', snippet: '"Hello, I\'m just starting to look at the resources..."' },
];

export default function HelperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      if (!user?.userId) return;
      try {
        const data = await getPendingRequests(user.userId);
        setPendingRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
        setPendingRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    }
    fetchPending();
  }, [user?.userId]);

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user?.username || 'Helper'}</h1>
          <p className={styles.welcomeSub}>Your clinical overview for today.</p>
        </header>

        {/* Stat Cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Sessions</p>
            <h3 className={styles.statValue}>12</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              <span className={styles.trendIcon}>↑</span> 2 more than yesterday
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Avg Rating</p>
            <h3 className={styles.statValue}>4.9</h3>
            <div className={styles.statMeta + ' ' + styles.metaOrange}>
              ★ Top 5% of Helpers
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Response Rate</p>
            <h3 className={styles.statValue}>98%</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              ✓ Exceeding target
            </div>
          </div>
          <div className={styles.statCardOnline}>
            <p className={styles.statLabelLight}>Online Now</p>
            <h3 className={styles.statValueLight}>Active</h3>
            <div className={styles.onlineStatus}>
              <span className={styles.onlinePulse} />
              Visible to patients
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Incoming Requests */}
          <section className={styles.requestsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Incoming Requests</h2>
              <span className={styles.newBadge}>{pendingRequests.length} Pending</span>
            </div>
            <div className={styles.requestList}>
              {loadingRequests ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>Loading requests...</p>
              ) : pendingRequests.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No pending requests at the moment.</p>
              ) : (
                pendingRequests.map((req) => (
                <div
                  key={req.session_id}
                  className={[styles.requestCard, styles.urgency_moderate].join(' ')}
                >
                  <div className={styles.requestTop}>
                    <div className={styles.requestMeta}>
                      <span className={styles.reqAnon}>User #{req.user_id}</span>
                      <span className={[styles.urgencyBadge, styles.badge_moderate].join(' ')}>
                        <span className={styles.urgencyDot} />
                        Pending
                      </span>
                    </div>
                    <button
                      className={styles.viewBriefBtn}
                      onClick={() => navigate(`/helper/request/${req.session_id}`)}
                    >
                      View Brief <span>›</span>
                    </button>
                  </div>
                  <p className={styles.reqSnippet}>Session ID: {req.session_id}</p>
                  <p className={styles.reqTime}>
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                ))
              )}
            </div>
          </section>

          {/* Active Sessions */}
          <section className={styles.sessionsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Sessions</h2>
              <button className={styles.viewAllLink}>View All Sessions</button>
            </div>
            <div className={styles.sessionList}>
              {activeSessions.map((s) => (
                <div key={s.id} className={styles.sessionRow}>
                  <div className={styles.sessionLeft}>
                    <div className={styles.sessionAvatar}>{s.initials}</div>
                    <div>
                      <p className={styles.sessionUserId}>User ID: #{s.userId}</p>
                      <p className={styles.sessionDuration}>{s.duration}</p>
                    </div>
                  </div>
                  <span className={styles.sessionOnlineDot} />
                  <div className={styles.sessionSnippet}>{s.snippet}</div>
                  <button
                    className={styles.goToChatBtn}
                    onClick={() => navigate(`/helper/session/${s.id}`)}
                  >
                    💬 Go to Chat
                  </button>
                </div>
              ))}
            </div>

            {/* Capacity Card */}
            <div className={styles.capacityCard}>
              <h4 className={styles.capacityTitle}>Capacity Update</h4>
              <p className={styles.capacityText}>
                You've handled 24 requests today. Taking a 5-minute breather can improve your response quality.
              </p>
              <button className={styles.capacityBtn}>Set Break Timer</button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
