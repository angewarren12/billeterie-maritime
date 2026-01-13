import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Booking = lazy(() => import('./pages/Booking'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const ClientBookingDetail = lazy(() => import('./pages/ClientBookingDetail'));
const PublicTicket = lazy(() => import('./pages/PublicTicket'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Public Pages
const DeparturesDisplay = lazy(() => import('./pages/public/DeparturesDisplay'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ListTrips = lazy(() => import('./pages/admin/trips/ListTrips'));
const ListRoutes = lazy(() => import('./pages/admin/trips/ListRoutes'));
const CreateTrip = lazy(() => import('./pages/admin/trips/wizard/CreateTripWizard'));
const ListPorts = lazy(() => import('./pages/admin/ports/ListPorts'));
const ListShips = lazy(() => import('./pages/admin/ships/ListShips'));
const ListSubscriptionPlans = lazy(() => import('./pages/admin/subscription-plans/ListSubscriptionPlans'));
const ListBookings = lazy(() => import('./pages/admin/bookings/ListBookings'));
const AdminBookingDetail = lazy(() => import('./pages/admin/bookings/BookingDetail'));
const ListSubscriptions = lazy(() => import('./pages/admin/subscriptions/ListSubscriptions'));
const ListUsers = lazy(() => import('./pages/admin/users/ListUsers'));
const UserDetail = lazy(() => import('./pages/admin/users/UserDetail'));
const Reports = lazy(() => import('./pages/admin/reports/Reports'));
const POSDashboard = lazy(() => import('./pages/admin/pos/POSDashboard'));
const AccessMonitoring = lazy(() => import('./pages/admin/ports/AccessMonitoring'));
const ListCashDesks = lazy(() => import('./pages/admin/cash-desks/ListCashDesks'));

import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider, useAuth } from './contexts/AuthContext';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
  </div>
);

// Helper pour cacher Header/Footer sur l'admin
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isLoading } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');

  // We only block the screen if there's no user AND we are trying to access a protected route
  // Public routes should never show the full screen loader
  if (isLoading && isAdmin && location.pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-900 to-gray-900 opacity-50 animate-pulse"></div>
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
          <p className="text-ocean-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Initialisation Sécurisée</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isAdmin ? 'bg-gray-100' : 'bg-gray-50/50'}`}>
      {!isAdmin && <Header />}
      <main className={isAdmin ? '' : 'flex-1'}>
        {children}
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                maxWidth: '500px',
              },
            }}
          />
        </>
      )}
      {isAdmin && <Toaster position="top-right" />}
    </div>
  );
};

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <LayoutWrapper>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/voyage/:id" element={<TripDetails />} />
                <Route path="/reserver" element={<Booking />} />
                <Route path="/confirmation/:id" element={<Confirmation />} />
                <Route path="/reservation/:id" element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                } />
                <Route path="/ticket/:id" element={
                  <ProtectedRoute>
                    <ClientBookingDetail />
                  </ProtectedRoute>
                } />
                <Route path="/billet/:reference" element={<PublicTicket />} />
                <Route path="/mon-compte" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Register />} />
                <Route path="/affichage/departs" element={<DeparturesDisplay />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="trips" element={<ListTrips />} />
                  <Route path="routes" element={<ListRoutes />} />
                  <Route path="trips/create" element={<CreateTrip />} />
                  <Route path="ports" element={<ListPorts />} />
                  <Route path="ships" element={<ListShips />} />
                  <Route path="subscription-plans" element={<ListSubscriptionPlans />} />
                  <Route path="subscriptions" element={<ListSubscriptions />} />
                  <Route path="bookings" element={<ListBookings />} />
                  <Route path="bookings/:id" element={<AdminBookingDetail />} />
                  <Route path="users" element={<ListUsers />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="cash-desks" element={<ListCashDesks />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="pos" element={<POSDashboard />} />
                  <Route path="monitoring" element={<AccessMonitoring />} />
                </Route>
              </Routes>
            </Suspense>
          </LayoutWrapper>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
