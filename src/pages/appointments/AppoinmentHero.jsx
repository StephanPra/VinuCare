import { AlertIcon } from '../../components/ui/Icons';

export default function AppointmentHero() {
  return (
    <div className="page-hero-wrap">
      <div className="page-hero-img">
        <img 
          src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=70" 
          alt="Book appointment" 
        />
      </div>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <span className="pill-tag">Online Booking</span>
        <h1>Schedule Your Visit</h1>
        <p>Easy online booking — we confirm within 2 hours. Select your pet, service and preferred time.</p>
      </div>
    </div>
  );
}

export function EmergencyStrip() {
  return (
    <a href="tel:+94789416906" className="appt-emergency-strip">
      <span className="appt-emergency-icon"><AlertIcon size={18} /></span>
      <span>Pet emergency? Call us now — <strong>+94 78 941 6906</strong></span>
    </a>
  );
}