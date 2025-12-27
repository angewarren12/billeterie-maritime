import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Booking = lazy(() => import('./pages/Booking'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const PublicTicket = lazy(() => import('./pages/PublicTicket'));

import { AuthProvider } from './contexts/AuthContext';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50/50">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/voyage/:id" element={<TripDetails />} />
                <Route path="/reserver" element={<Booking />} />
                <Route path="/confirmation/:id" element={<Confirmation />} />
                <Route path="/reservation/:id" element={<BookingDetails />} />
                <Route path="/billet/:reference" element={<PublicTicket />} />
                <Route path="/mon-compte" element={<Dashboard />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
