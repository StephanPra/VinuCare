import { useState, useEffect, useRef } from 'react';

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

// Reusable DM thread view — used by both the staff "Message Admin" tab
// and the Admin inbox's open-conversation panel. `currentUserId` decides
// which bubbles render as "mine" (right-aligned) vs "theirs" (left).
export default function MessageThread({ messages, currentUserId, onSend, loading, emptyLabel, placeholder = 'Type a message…' }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="dm-thread">
      <div className="dm-thread-list" ref={listRef}>
        {loading && <p className="dm-empty">Loading messages…</p>}
        {!loading && messages.length === 0 && <p className="dm-empty">{emptyLabel || 'No messages yet.'}</p>}
        {!loading && messages.map((m) => {
          const isMine = String(m.senderId) === String(currentUserId);
          return (
            <div key={m.id} className={`dm-bubble-row ${isMine ? 'mine' : ''}`}>
              <div className={`dm-bubble ${isMine ? 'dm-bubble-mine' : 'dm-bubble-theirs'}`}>
                {!isMine && <div className="dm-bubble-sender">{m.senderName} · {m.senderRole}</div>}
                <div className="dm-bubble-body">{m.body}</div>
                <div className="dm-bubble-time">{formatTime(m.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <form className="dm-input-row" onSubmit={handleSubmit}>
        <input
          className="dm-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={sending}
        />
        <button type="submit" className="dm-send" disabled={sending || !draft.trim()}>Send</button>
      </form>
    </div>
  );
}
