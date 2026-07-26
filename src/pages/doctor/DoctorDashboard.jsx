import { useState } from 'react';
import AdminAppointments from '../admin/AdminAppointments';
import DoctorCalendar from './DoctorCalendar';
import { CalendarIcon } from '../../components/ui/Icons';
import '../../styles/admin.css';
import vinuLogo from '../../assets/logo/vinucare-logo.png';

const NAV_ITEMS = [
  { id: 'appointments', label: 'Appointments', icon: <CalendarIcon size={17} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={17} /> },
];

export default function DoctorDashboard({ onNavigate, doctorName = 'Doctor' }) {
  const [tab, setTab] = useState('appointments');

  return (
    <div id="page-admin">
      <aside className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={vinuLogo} alt="" style={{ width: 22, height: 22, borderRadius: 6, display: 'block' }} /> VinuCare <span className="admin-brand-badge">DOCTOR</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          Signed in as<br /><strong style={{ color: '#fff' }}>{doctorName}</strong>
          <button className="admin-exit-btn" onClick={() => onNavigate && onNavigate('home')}>
            ← Back to site
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'appointments' && <AdminAppointments />}
        {tab === 'calendar' && <DoctorCalendar />}
      </main>
    </div>
  );
}