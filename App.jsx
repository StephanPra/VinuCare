import { useState, useEffect } from 'react';
import './styles/base.css';
import './styles/nav-footer.css';
import './styles/auth.css';
import Nav from './components/Nav';
import Home from './pages/home/Home';
import Footer from './components/Footer';
import Service from './pages/services/Service';
import Appointment from './pages/appointments/Appointment';
import Shop from './pages/shop/Shop';
import CartPage from './pages/shop/CartPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

function PageSwitch({ page, onNavigate, selectedService, setSelectedService, isLoggedIn, setIsLoggedIn }) {
  switch (page) {
    case 'home':
      return <Home onNavigate={onNavigate} />;
    case 'services':
      return (
        <Service
          onBook={(serviceTitle) => {
            setSelectedService(serviceTitle);
            onNavigate('appointments');
          }}
        />
      );
    case 'appointments':
      return <Appointment selectedService={selectedService} />;
    case 'shop':
      return <Shop />;
    case 'cart':
      return <CartPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} />;
    case 'reviews':
      return <ReviewsPage onNavigate={onNavigate} />;
    case 'login':
      return <Login onNavigate={onNavigate} setIsLoggedIn={setIsLoggedIn} />;
    case 'signup':
      return <Signup onNavigate={onNavigate} />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedService, setSelectedService] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <>
      <Nav
        activePage={page}
        onNavigate={setPage}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div id="app">
        <PageSwitch
          page={page}
          onNavigate={setPage}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      </div>

      <Footer onNavigate={setPage} />
    </>
  );
}
