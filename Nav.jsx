import { useState, useContext } from 'react';
import { ShopContext } from '../pages/shop/ShopContext';

const NAV_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'services', label: 'Services' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'shop', label: 'Shop' },
  { key: 'reviews', label: 'Reviews' },
];

const MOBILE_LINKS = [
  { key: 'home',         label: '🏠 Home' },
  { key: 'services',     label: '🐾 Services' },
  { key: 'appointments', label: '📅 Appointments' },
  { key: 'shop',         label: '🛍️ Shop' },
  { key: 'reviews',      label: '⭐ Reviews' },
];

export default function Nav({ activePage, onNavigate, isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { getTotalItems, isAnimating } = useContext(ShopContext);
  const cartCount = getTotalItems();

  const goTo = (page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    goTo('home');
  };

  return (
    <>
      <style>{`
        .vinu-cart-btn-wrapper {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: none !important;
          border: none !important;
          padding: 6px !important;
          cursor: pointer !important;
        }

        .vinu-cart-icon {
          font-size: 1.5rem !important;
          line-height: 1 !important;
          position: relative !important;
        }

        .vinu-amazon-badge {
          position: absolute !important;
          top: -6px !important;
          left: 62% !important;
          transform: translateX(-50%) !important;
          background-color: #7C5CE8 !important;
          color: white !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          min-width: 14px !important;
          height: 14px !important;
          padding: 0 !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15) !important;
          transition: transform 0.2s ease-in-out !important;
          pointer-events: none !important;
        }

        .vinu-amazon-badge.pop-bump {
          transform: translateX(-50%) scale(1.2) !important;
          animation: amazonBounce 0.4s ease-in-out;
        }

        @keyframes amazonBounce {
          0%   { transform: translateX(-50%) scale(1); }
          50%  { transform: translateX(-50%) scale(1.3); }
          100% { transform: translateX(-50%) scale(1); }
        }

        /* Account button styles */
        .nav-account-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-account-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(124, 92, 232, 0.1);
          border: 1px solid rgba(124, 92, 232, 0.3);
          color: #7C5CE8;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-account-btn:hover {
          background: rgba(124, 92, 232, 0.18);
        }

        .nav-logout-btn {
          background: none;
          border: 1px solid #ddd;
          color: #888;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-logout-btn:hover {
          border-color: #e55;
          color: #e55;
        }

        /* Mobile account links */
        .m-account-link {
          display: block;
          padding: 12px 20px;
          font-size: 1rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      <nav>
        <a className="logo" onClick={() => goTo('home')}>
          <div className="logo-mark">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#navGrad)" />
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#7C5CE8" />
                  <stop offset="100%" stopColor="#4F2FBD" />
                </linearGradient>
              </defs>
              <ellipse cx="20" cy="23" rx="7" ry="6" fill="white" opacity="0.95" />
              <circle cx="13.5" cy="17" r="2.6" fill="white" opacity="0.9" />
              <circle cx="26.5" cy="17" r="2.6" fill="white" opacity="0.9" />
              <circle cx="17" cy="15" r="2.2" fill="white" opacity="0.9" />
              <circle cx="23" cy="15" r="2.2" fill="white" opacity="0.9" />
              <rect x="19" y="20.5" width="2" height="5" rx="1" fill="url(#navGrad)" opacity="0.7" />
              <rect x="17.5" y="22" width="5" height="2" rx="1" fill="url(#navGrad)" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div className="logo-text">Vinu<span>Care</span></div>
            <span className="logo-sub">Veterinary &amp; Pet Care</span>
          </div>
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <a
                onClick={() => goTo(link.key)}
                id={`nav-${link.key}`}
                className={activePage === link.key ? 'active' : ''}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button className="nav-cta" onClick={() => goTo('appointments')}>Book Now</button>

          <button className="vinu-cart-btn-wrapper" onClick={() => goTo('cart')} title="View Cart">
            <span className="vinu-cart-icon">
              🛒
              <span className={`vinu-amazon-badge ${isAnimating ? 'pop-bump' : ''}`}>
                {cartCount}
              </span>
            </span>
          </button>

          {isLoggedIn ? (
            <div className="nav-account-wrap">
              <button className="nav-account-btn" onClick={() => goTo('home')}>
                👤 My Account
              </button>
              <button className="nav-logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => goTo('login')}>Log In</button>
          )}

          <button className="hamburger" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu">
        {NAV_LINKS.map((link) => (
          <a key={link.key} onClick={() => goTo(link.key)} id={`m-${link.key}`}>
            {{
              home: '🏠',
              services: '🐾',
              appointments: '📅',
              shop: '🛍️',
              reviews: '⭐',
            }[link.key]} {link.label}
          </a>
        ))}
        {isLoggedIn ? (
          <>
            <a className="m-account-link" onClick={() => goTo('home')}>👤 My Account</a>
            <a className="m-account-link" onClick={handleLogout}>🚪 Log Out</a>
          </>
        ) : (
          <a onClick={() => goTo('login')} id="m-login">🔑 Log In</a>
        )}
      </div>
    </>
  );
}
