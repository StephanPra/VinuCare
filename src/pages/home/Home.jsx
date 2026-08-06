import '../../styles/home.css';
import heroAvatar1 from '../../assets/images/hero-avatar-1.jpg';
import heroAvatar2 from '../../assets/images/hero-avatar-2.jpg';
import heroAvatar3 from '../../assets/images/hero-avatar-3.jpg';
import aboutMain from '../../assets/images/about-main.jpg';
import aboutAccent from '../../assets/images/about-accent.jpg';
import serviceCheckup from '../../assets/images/service-checkup.jpg';
import serviceGrooming from '../../assets/images/service-grooming.jpg';
import serviceBoarding from '../../assets/images/service-boarding.jpg';
import serviceTraining from '../../assets/images/service-training.jpg';
import serviceSpa from '../../assets/images/service-spa.jpg';
import serviceEmergency from '../../assets/images/service-emergency.jpg';
import stats1 from '../../assets/images/stats-1.jpg';
import stats2 from '../../assets/images/stats-2.jpg';
import stats3 from '../../assets/images/stats-3.jpg';
import whyMain from '../../assets/images/why-main.jpg';
import whySub from '../../assets/images/why-sub.jpg';
import teamAmara from '../../assets/images/veterinarian 2.jpg';
import teamJames from '../../assets/images/dr_athu.jpeg';
import clinicInterior from '../../assets/images/clinic-interior.jpg';
import bannerNewpatient from '../../assets/images/banner-newpatient.jpg';
import bannerGrooming from '../../assets/images/banner-grooming.webp';
import bannerBoarding from '../../assets/images/banner-boarding.jpg';
import drools   from '../../assets/brands/Drools.webp';
import hills    from '../../assets/brands/hills logo.jpg';
import meo from '../../assets/brands/meo-logo.webp';
import pedigree from '../../assets/brands/pedigree.png';
import royalCanin from '../../assets/brands/royal-canin.webp';
import whiskas  from '../../assets/brands/whiskas.png';
import heroVideo from '../../assets/video/hero-clinic.mp4';
import { useState, useEffect } from 'react';

// Subscription plans previewed in the hero float cards
const subPlans = [
  { icon: '🐾', name: 'Basic Care',    detail: 'Monthly wellness check',  price: '$29/mo', color: 'var(--lavender-400)' },
  { icon: '🩺', name: 'Standard Care', detail: 'Wellness + grooming',      price: '$59/mo', color: 'var(--teal-400, #38b2ac)' },
  { icon: '⭐', name: 'Premium Care',  detail: 'All-inclusive plan',        price: '$99/mo', color: 'var(--amber-400, #f6ad55)' },
];

// Current promotions — wide photo banners, Chewy-style
const offers = [
  {
    tag: 'New Patients', bg: '#3730A3', accentBtn: '#fff', accentText: '#3730A3', icon: '🐾',
    title: 'First Wellness Exam, On Us',
    desc: 'Complete health check, vaccination review and microchipping for new patients.',
    price: '$29', was: '$75',
    cta: 'Book Now',
    img: bannerNewpatient,
    alt: 'Happy dog and cat sitting together',
  },
  {
    tag: 'Bundle Deal', bg: '#0F766E', accentBtn: '#fff', accentText: '#0F766E', icon: '🦴',
    title: 'Grooming + Dental, Bundled',
    desc: 'Full grooming session combined with professional dental scaling for a healthy, fresh pup.',
    price: '$65', was: '$110',
    cta: 'Book Now',
    img: bannerGrooming,
    alt: 'Dog being groomed and bathed',
  },
  {
    tag: 'Monthly Special', bg: '#B45309', accentBtn: '#fff', accentText: '#B45309', icon: '🏠',
    title: '5 Nights of Boarding Bliss',
    desc: '5 nights of supervised boarding with daily enrichment activities and bedtime story updates.',
    price: '$149', was: '$220',
    cta: 'Reserve a Spot',
    img: bannerBoarding,
    alt: 'Dog relaxing happily at a boarding facility',
  },
];

// Services overview — same banner treatment as Special Offers
const servicesBanners = [
  {
    id: 1, tag: 'Most Popular', bg: '#3730A3', icon: '🩺',
    title: 'Veterinary Check-ups',
    desc: 'Comprehensive wellness exams, vaccinations, blood panels and preventive care from our licensed vets.',
    cta: 'View Service', img: serviceCheckup, alt: 'Veterinary checkup',
  },
  {
    id: 2, tag: 'Grooming', bg: '#0F766E', icon: '✂️',
    title: 'Grooming & Styling',
    desc: 'Professional bathing, breed-specific cuts, nail trimming and ear cleaning using premium pet-safe products.',
    cta: 'View Service', img: serviceGrooming, alt: 'Dog grooming',
  },
  {
    id: 4, tag: 'Boarding', bg: '#B45309', icon: '🏨',
    title: 'Boarding & Daycare',
    desc: 'Safe, comfortable stays with 24/7 supervision, individual playtime and daily photo updates to keep you connected.',
    cta: 'View Service', img: serviceBoarding, alt: 'Pet boarding',
  },
  {
    id: 5, tag: 'Training', bg: '#5B21B6', icon: '🐕',
    title: 'Training & Behaviour',
    desc: 'Positive reinforcement training for puppies and adults — obedience, socialisation and behaviour correction.',
    cta: 'View Service', img: serviceTraining, alt: 'Dog training',
  },
  {
    id: 6, tag: 'Spa', bg: '#9D174D', icon: '🌸',
    title: 'Spa & Wellness',
    desc: 'Aromatherapy baths, therapeutic massage, mud treatments and paw care for a fully pampered companion.',
    cta: 'View Service', img: serviceSpa, alt: 'Cat wellness spa',
  },
  {
    id: 3, tag: '24/7 Available', bg: '#065F46', icon: '🚨',
    title: 'Emergency Care',
    desc: 'Rapid response emergency consultations with on-site diagnostic equipment and intensive care facilities.',
    cta: 'View Service', img: serviceEmergency, alt: 'Emergency vet care',
  },
];

// Team — same banner treatment as Special Offers
const teamBanners = [
  {
    tag: 'Lead Veterinarian', bg: '#4C1D95', icon: '🩺',
    name: 'Dr. Amara Silva', role: 'DVM · Small Animal Medicine · 12 yrs experience',
    img: teamAmara,
     bio: 'Specializes in preventive care and wellness exams for dogs and cats. Based at our Colombo main clinic, Dr. Silva has led over 4,000 successful treatments.',
  },
  {
    tag: 'Surgeon', bg: '#1E3A8A', icon: '🔬',
    name: 'Dr. Athukorala', role: 'DVM · Veterinary Surgery · 9 yrs experience',
    img: teamJames,
    bio: 'Specializes in orthopedic and soft-tissue surgery. Based at our Colombo main clinic, Dr. Okafor has performed over 1,200 surgical procedures.',
  },
];

export default function Home({ onNavigate }) {
  const [homeReviews, setHomeReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
          const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
          return dateB - dateA;
        });
        setHomeReviews(sorted.slice(0, 3));
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, []);

  return (
    <div id="page-home" className="page active">

      {/* Shared photo-banner styles, reused by Services, Stats, Team & Why Choose Us */}
      <style>{`
        .photo-banner-list {
          display: flex; flex-direction: column; gap: 14px;
        }
        .photo-banner {
          border-radius: 20px; overflow: hidden;
          display: flex; align-items: stretch; flex-wrap: wrap;
          min-height: 220px; cursor: pointer;
        }
        .photo-banner.reverse { flex-direction: row-reverse; }
        .photo-banner-text {
          flex: 1 1 320px; padding: 36px 40px;
          display: flex; flex-direction: column; justify-content: center;
          color: #fff;
        }
        .services-section .photo-banner {
          min-height: 160px;
        }
        .services-section .photo-banner-text {
          padding: 24px 28px;
        }
        .services-section .photo-banner-text h3 {
          font-size: clamp(1.1rem,1.8vw,1.4rem) !important;
        }
        .services-section .photo-banner-text p {
          margin-bottom: 12px !important;
          font-size: .85rem;
        }
        .services-section .photo-banner-img {
          min-height: 160px;
        }
        .team-section .photo-banner-list {
          flex-direction: row;
          flex-wrap: wrap;
        }
        .team-section .photo-banner {
          flex: 1 1 300px;
          flex-direction: column;
          height: fit-content !important;
        }
        .team-section .photo-banner-text {
          padding: 24px 28px;
        }
        .team-section .photo-banner.reverse {
          flex-direction: column;
        }
        .team-section .photo-banner-text h3 {
          font-size: clamp(1.1rem,1.8vw,1.4rem) !important;
        }
        .team-section .photo-banner-text p {
          margin-bottom: 12px !important;
          font-size: .85rem;
        }
        .team-section .photo-banner-img {
          min-height: 340px;
          max-height: 380px;
          flex: 1 1 340px;
          order: 1;
          align-self: stretch;
          width: 100%;
        }
        .team-section .photo-banner-img img {
          object-position: center 20%;
        }
        .team-section .photo-banner-text {
          order: 2;
          flex: 0 1 auto !important;
          height: fit-content !important;
          padding: 20px 24px !important;
          justify-content: flex-start !important;
        }
        .team-section .photo-banner {
          align-items: flex-start !important;
          height: fit-content !important;
        }
        .photo-banner-tag {
          align-self: flex-start;
          padding: 4px 12px !important; border-radius: 999px !important;
          font-size: .75rem !important; font-weight: 700 !important; letter-spacing: .04em !important;
          margin-bottom: 14px !important;
          color: #fff !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.14)) !important;
          border: 1px solid rgba(255,255,255,0.45) !important;
          backdrop-filter: blur(10px) saturate(160%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(160%) !important;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.35) !important;
        }
        .photo-banner { position: relative; }
        .glass-icon-badge {
          position: absolute; top: 18px; left: 18px; z-index: 3;
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.12));
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow: 0 6px 18px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.45);
        }
        .team-section .glass-icon-badge { top: 16px; left: 16px; }
        .services-section .glass-icon-badge + .photo-banner-text .photo-banner-tag {
          margin-left: 56px;
        }
        .photo-banner-img { flex: 1 1 280px; min-height: 220px; }
        .photo-banner-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-video { display: none; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline poster={aboutMain}>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">🟢 Now Accepting New Patients</div>
          <h1>Expert Veterinary &amp; Pet Care You Can <em>Trust</em></h1>
          <p>Comprehensive health services, grooming, boarding and a curated pet store — all under one compassionate roof.</p>
          <div className="hero-btns">
            <button className="btn btn-primary" onClick={() => onNavigate('appointments')}>Book an Appointment</button>
            <button className="btn btn-white" onClick={() => onNavigate('shop')}>Shop</button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <img src={heroAvatar1} alt="Happy pet owner" />
              <img src={heroAvatar2} alt="Happy pet owner" />
              <img src={heroAvatar3} alt="Happy pet owner" />
            </div>
            <div className="trust-text">
              <p>Trusted by 5,000+ Pet Families</p>
              <span>⭐⭐⭐⭐⭐ 4.9 average rating</span>
            </div>
          </div>
        </div>
        <div className="hero-float-card">
          {subPlans.map((plan, i) => (
            <div
              className="float-card"
              key={plan.name}
              onClick={() => {
                const target = document.getElementById(`offer-${i}`);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                else onNavigate('appointments');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="float-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)', fontSize: '1.4rem' }}>
                {plan.icon}
              </div>
              <div className="float-card-text">
                <strong>{plan.name}</strong>
                <span>{plan.detail}</span>
                <span style={{ fontWeight: 700, color: '#6b21a8', fontSize: '.8rem' }}>{plan.price}</span>
              </div>
              <div className="float-dot" style={{ background: plan.color }}></div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-item"><div className="trust-icon">🩺</div><div><strong>Licensed Vets</strong><span>Board-certified professionals</span></div></div>
        <div className="trust-item"><div className="trust-icon">🏥</div><div><strong>Full Clinic</strong><span>On-site lab &amp; diagnostics</span></div></div>
        <div className="trust-item"><div className="trust-icon">🕐</div><div><strong>Emergency Care</strong><span>24/7 urgent support</span></div></div>
        <div className="trust-item"><div className="trust-icon">✅</div><div><strong>Certified Groomers</strong><span>5+ years experience</span></div></div>
        <div className="trust-item"><div className="trust-icon">🚗</div><div><strong>Free Pick-up</strong><span>Within 10km radius</span></div></div>
      </div>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-img-wrap">
          <div className="about-main-img">
            <img src={aboutMain} alt="Veterinarian examining dog" loading="lazy" />
          </div>
          <div className="about-accent-img">
            <img src={aboutAccent} alt="Pet care" loading="lazy" />
          </div>
          <div className="about-badge"><div className="num">8+</div><div className="lbl">Years of Care</div></div>
        </div>
        <div className="about-text">
          <span className="pill-tag">About VinuCare</span>
          <h2>A Clinic That Feels Like <em>Home</em> for Your Pet</h2>
          <p>Founded in 2016, VinuCare is a full-service veterinary clinic and pet care centre dedicated to the health and happiness of every animal that walks through our doors.</p>
          <p>Our team of licensed veterinarians, certified groomers and experienced caregivers work together to provide compassionate, evidence-based care for dogs, cats, birds, fish and small animals.</p>
          <div className="about-checks">
            <div className="check-item"><div className="check-icon">✓</div>Fully equipped diagnostic laboratory</div>
            <div className="check-item"><div className="check-icon">✓</div>AVMA-accredited veterinary practice</div>
            <div className="check-item"><div className="check-icon">✓</div>Certified professional grooming suite</div>
            <div className="check-item"><div className="check-icon">✓</div>Climate-controlled boarding facility</div>
            <div className="check-item"><div className="check-icon">✓</div>Fear-free certified environment</div>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('appointments')}>Schedule a Visit</button>
        </div>
      </section>

      {/* SERVICES OVERVIEW — photo-banner style */}
      <section className="services-section">
        <div className="section-header">
          <span className="pill-tag">Our Services</span>
          <h2>Complete Care for Every Pet</h2>
          <p>From routine wellness exams to specialist treatments, we cover every aspect of your pet's health and wellbeing.</p>
        </div>
        <div className="photo-banner-list">
          {servicesBanners.map((svc, i) => (
            <div
              key={svc.title}
              className={`photo-banner${i % 2 === 1 ? ' reverse' : ''}`}
              style={{ background: svc.bg }}
              onClick={() => onNavigate('services', svc.id)}
            >
              <div className="glass-icon-badge">{svc.icon}</div>
              <div className="photo-banner-text">
                <span className="photo-banner-tag">{svc.tag}</span>
                <h3 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', margin: '0 0 8px', lineHeight: 1.2 }}>{svc.title}</h3>
                <p style={{ opacity: 0.9, margin: '0 0 18px', maxWidth: '380px' }}>{svc.desc}</p>
                <button
                  className="btn"
                  style={{ background: '#fff', color: svc.bg, fontWeight: 700, alignSelf: 'flex-start' }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('services', svc.id); }}
                >
                  {svc.cta} →
                </button>
              </div>
              <div className="photo-banner-img">
                <img src={svc.img} alt={svc.alt} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS — photo-banner style */}
      <section className="stats-section">
        <div
          className="photo-banner"
          style={{ background: '#1E1B4B', minHeight: '380px', cursor: 'default' }}
        >
          <div className="photo-banner-text" style={{ flex: '1 1 380px' }}>
            <span className="photo-banner-tag">By The Numbers</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,3vw,2.4rem)', margin: '0 0 10px', lineHeight: 1.2 }}>
              A Clinic Built Around Your Pet's Wellbeing
            </h2>
            <p style={{ opacity: 0.85, marginBottom: '24px', maxWidth: '380px' }}>
              Since 2016 we've grown from a small practice into a full-service veterinary centre trusted by thousands of families across the region.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px 24px' }}>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>5K+</div><div style={{ opacity: 0.8, fontSize: '.85rem' }}>Pet Families Served</div></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>14</div><div style={{ opacity: 0.8, fontSize: '.85rem' }}>Expert Clinicians</div></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>98%</div><div style={{ opacity: 0.8, fontSize: '.85rem' }}>Satisfaction Rate</div></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>8yr</div><div style={{ opacity: 0.8, fontSize: '.85rem' }}>Years Established</div></div>
            </div>
          </div>
          <div className="photo-banner-img" style={{ display: 'flex', gap: '4px' }}>
            <img src={stats1} alt="Clinic waiting room" loading="lazy" style={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover' }} />
            <img src={stats2} alt="Pets at home" loading="lazy" style={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover' }} />
            <img src={stats3} alt="Clinic team" loading="lazy" style={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* TEAM — photo-banner style */}
      <section className="team-section">
        <div className="section-header">
          <span className="pill-tag">Our Team</span>
          <h2>Meet Our Veterinary Professionals</h2>
          <p>A dedicated team of certified vets, groomers and carers who treat your pets as their own.</p>
        </div>
        <div className="photo-banner-list">
          {teamBanners.map((member, i) => (
            <div
              key={member.name}
              className={`photo-banner${i % 2 === 1 ? ' reverse' : ''}`}
              style={{ background: member.bg, cursor: 'default' }}
            >
              <div className="glass-icon-badge">{member.icon}</div>
              <div className="photo-banner-text">
                <span className="photo-banner-tag">{member.tag}</span>
                <h3 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', margin: '0 0 8px' }}>{member.name}</h3>
                <p style={{ opacity: 0.9, margin: 0 }}>{member.role}</p>
                <p style={{ opacity: 0.8, margin: '12px 0 0', fontSize: '.9rem', lineHeight: 1.6, maxWidth: '90%' }}>{member.bio}</p>
              </div>
              <div className="photo-banner-img">
                <img src={member.img} alt={member.name} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OFFERS */}
      <section className="offers-section">
        <div className="section-header">
          <span className="pill-tag">Special Offers</span>
          <h2>Current Promotions</h2>
          <p>Exclusive deals for new and returning pet families.</p>
        </div>
        <div className="photo-banner-list">
          {offers.map((offer, i) => (
            <div
              key={offer.title}
              id={`offer-${i}`}
              className="photo-banner"
              onClick={() => onNavigate('appointments')}
              style={{
                background: offer.bg, borderRadius: '20px', overflow: 'hidden',
                display: 'flex', alignItems: 'stretch', cursor: 'pointer',
                minHeight: '50px', flexWrap: 'wrap', scrollMarginTop: '100px'
              }}
            >
              <div className="glass-icon-badge">{offer.icon}</div>
              <div style={{
                flex: '1 1 320px', padding: '24px 28px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                color: '#fff'
              }}>
                <span className="photo-banner-tag" style={{ marginBottom: '10px', marginLeft: '56px' }}>{offer.tag}</span>
                <h3 style={{ fontSize: 'clamp(1.1rem,1.8vw,1.4rem)', margin: '0 0 6px', lineHeight: 1.2 }}>{offer.title}</h3>
                <p style={{ opacity: 0.9, margin: '0 0 12px', maxWidth: '380px', fontSize: '.85rem' }}>{offer.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{offer.price}</span>
                  <s style={{ opacity: 0.7 }}>{offer.was}</s>
                  <button
                    className="btn"
                    style={{ background: offer.accentBtn, color: offer.accentText, fontWeight: 700, marginLeft: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); onNavigate('appointments'); }}
                  >
                    {offer.cta}
                  </button>
                </div>
              </div>
              <div style={{ flex: '1 1 280px', minHeight: '160px' }}>
                <img
                  src={offer.img}
                  alt={offer.alt}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US — photo-banner style */}
      <section style={{ padding: '100px 5%' }}>
        <div className="section-header">
          <span className="pill-tag">Why VinuCare</span>
          <h2>The Standard of Care Your Pet Deserves</h2>
          <p>We combine clinical excellence with genuine compassion — because your pet's comfort matters as much as their health.</p>
        </div>
        <div
          className="photo-banner reverse"
          style={{ background: '#4C1D95', minHeight: '420px', cursor: 'default' }}
        >
          <div className="photo-banner-text" style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 28px' }}>
              <div><div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🩺</div><h4 style={{ margin: '0 0 4px' }}>Fear-Free Certified</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Protocols designed to reduce anxiety and create positive vet experiences.</p></div>
              <div><div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🧬</div><h4 style={{ margin: '0 0 4px' }}>In-House Diagnostics</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>On-site blood work, urinalysis and imaging for same-day results.</p></div>
              <div><div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📱</div><h4 style={{ margin: '0 0 4px' }}>Digital Health Records</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Access your pet's full health history and reports anytime online.</p></div>
              <div><div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💬</div><h4 style={{ margin: '0 0 4px' }}>Post-Visit Follow-Up</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Our team checks in after every appointment to ensure recovery.</p></div>
            </div>
          </div>
          <div className="photo-banner-img">
            <img src={whyMain} alt="Vet with pet owner" loading="lazy" />
          </div>
        </div>
      </section>

      {/* HOME REVIEWS */}
      <section className="home-reviews-section" style={{ background: 'var(--off-white)' }}>
        <div className="section-header">
          <span className="pill-tag">Testimonials</span>
          <h2>What Pet Parents Say About Us</h2>
        </div>
        <div className="reviews-row">
          {reviewsLoading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#888', width: '100%' }}>Loading reviews…</p>
          ) : homeReviews.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#888', width: '100%' }}>No reviews yet. Be the first!</p>
          ) : (
            homeReviews.map((review, i) => {
              const name = review.name || 'Anonymous';
              const petLabel = review.pet || 'Pet Owner';
              const text = review.review || '';
              const service = review.service || 'General';
              const stars = review.stars || '⭐⭐⭐⭐⭐';
              const initial = name.trim().charAt(0).toUpperCase() || '?';

              return (
                <div className="rev-card" key={review.id || review._id || i}>
                  <div className="rev-header">
                    <div className="rev-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#6b21a8', color: '#fff', fontWeight: 700 }}>{initial}</div>
                    <div><div className="rev-name">{name}</div><div className="rev-pet">🐾 {petLabel}</div></div>
                  </div>
                  <div className="rev-stars">{stars}</div>
                  <p className="rev-text">{text}</p>
                  <span className="rev-service">{service}</span>
                </div>
              );
            })
          )}
        </div>
        <div style={{ textAlign: 'center' }}><button className="btn btn-outline" onClick={() => onNavigate('reviews')}>Read All Reviews →</button></div>
      </section>
            {/* SHOP BY BRAND */}
      <section className="brands-section">
        <div className="section-header">
          <span className="pill-tag">Trusted Partners</span>
          <h2>Shop by Brand</h2>
          <p>We stock only the most trusted and vet-recommended pet nutrition brands in Sri Lanka.</p>
        </div>
          <div className="brands-scroll">
          {[
            { name: 'Royal Canin', color: '#c8102e', img: royalCanin },
            { name: 'Pedigree',    color: '#1455a3', img: pedigree   },
            { name: 'Whiskas',     color: '#7b2d8b', img: whiskas    },
            { name: 'Me-O',        color: '#f47920', img: meo        },
            { name: 'Drools',      color: '#2ecc71', img: drools     },
            { name: 'Hills',       color: '#003087', img: hills      },
          ].map(brand => (
            <div className="brand-tile" key={brand.name} onClick={() => onNavigate('shop')}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '14px',
                background: brand.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {brand.img
                  ? <img src={brand.img} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                }
              </div>
              <span className="brand-tile-name">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section">
        <div className="section-header">
          <span className="pill-tag">Find Us</span>
          <h2>Visit Our Clinic</h2>
          <p>Conveniently located with ample parking. Walk-ins welcome for urgent care.</p>
        </div>
        <div className="contact-inner">
          <div>
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps?q=VINU+Care+Agency,+Kamburugamuwa&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="VinuCare Location">
              </iframe>
            </div>
            <div className="contact-clinic-img">
              <img src={clinicInterior} alt="Clinic interior" loading="lazy" />
            </div>
          </div>
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>We're here to answer questions, schedule appointments and support you every step of the way.</p>
            <div className="contact-items">
              <div className="contact-item"><div className="contact-item-icon">📍</div><div><strong>Address</strong><span>VINU Care Agency, Thathsara, Kamburugamuwa</span></div></div>
              <div className="contact-item"><div className="contact-item-icon">📞</div><div><strong>Phone</strong><span>+94 78 941 6906</span></div></div>
              <div className="contact-item"><div className="contact-item-icon">✉️</div><div><strong>Email</strong><span>vinuagency@gmail.com</span></div></div>
              <div className="contact-item"><div className="contact-item-icon">🕐</div><div><strong>Hours</strong><span>Mon–Sat 8AM–7PM · Sun 9AM–3PM</span></div></div>
              <div className="contact-item"><div className="contact-item-icon">🚨</div><div><strong>Emergency</strong><span>24/7 Urgent Care Line: +94 71 422 9609</span></div></div>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('appointments')}>Book Appointment →</button>
          </div>
        </div>
      </section>

    </div>
  );
}