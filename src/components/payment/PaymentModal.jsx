import { useState } from 'react';
import { submitToPayHere } from './payhereRedirect';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { CardIcon, TagIcon } from '../ui/Icons';
import '../../styles/payment.css';
import { API_BASE_URL } from '../../config/api';

// orderType: 'shop' | 'appointment'
// orderId:   the numeric id of the order/appointment row
// amount:    the amount in LKR (used for display + PayHere)
// itemsDescription: short text shown on PayHere's checkout page
export default function PaymentModal({ open, onClose, orderType, orderId, amount, itemsDescription, user, onPaid }) {
  const { error: notifyError } = useUIFeedback();
  const [view, setView] = useState('methods'); // 'methods' | 'card-loading' | 'koko-loading'

  if (!open) return null;

  const formattedAmount = Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function handleCard() {
    setView('card-loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/payhere/hash`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, orderType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not start card checkout');

      // Redirects the whole browser tab to PayHere's hosted checkout —
      // control returns via /payment-return or /payment-cancel.
      submitToPayHere({
        checkoutUrl: data.checkoutUrl,
        merchantId: data.merchantId,
        hash: data.hash,
        amount: data.amount,
        currency: data.currency,
        orderId: data.orderId,
        rawOrderId: orderId,
        orderType,
        user,
        itemsDescription,
        notifyUrl: data.notifyUrl,
      });
    } catch (err) {
      console.error('PayHere start error:', err);
      notifyError(err.message || 'Could not start card checkout.');
      setView('methods');
    }
  }

  async function handleKoko() {
    setView('koko-loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/koko/initiate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, orderType }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message || 'Koko is not available yet.');
        setView('methods');
        return;
      }
      // Once Koko is approved and this route returns a real redirect URL,
      // navigate the browser there the same way PayHere does above.
    } catch (err) {
      notifyError('Could not reach Koko right now.');
      setView('methods');
    }
  }

  return (
    <div className="pm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-box">
        <div className="pm-head">
          <h3>Choose payment method</h3>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="pm-amount">Amount due: <strong>Rs. {formattedAmount}</strong></p>

        {view === 'methods' && (
          <div className="pm-methods">
            <button type="button" className="pm-method-btn" onClick={handleCard}>
              <span className="pm-method-icon pm-icon-card"><CardIcon size={20} /></span>
              <span className="pm-method-info">
                <span className="pm-method-name">Visa / Mastercard</span>
                <span className="pm-method-sub">Secure checkout via PayHere</span>
              </span>
              <span className="pm-method-arrow">›</span>
            </button>

            <button type="button" className="pm-method-btn" onClick={handleKoko}>
              <span className="pm-method-icon pm-icon-koko"><TagIcon size={20} /></span>
              <span className="pm-method-info">
                <span className="pm-method-name">Koko — Pay Later</span>
                <span className="pm-method-sub">Buy now, pay in installments</span>
              </span>
              <span className="pm-method-arrow">›</span>
            </button>
          </div>
        )}

        {view === 'card-loading' && (
          <div className="pm-loading">
            <div className="pm-spinner" />
            <span>Redirecting you to secure checkout…</span>
          </div>
        )}

        {view === 'koko-loading' && (
          <div className="pm-loading">
            <div className="pm-spinner" />
            <span>Checking Koko availability…</span>
          </div>
        )}
      </div>
    </div>
  );
}