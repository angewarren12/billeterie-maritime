import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: 'admin' | 'staff';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
        );
    }

    if (!user) {
        const isAdminRoute = location.pathname.startsWith('/admin');
        const redirectPath = isAdminRoute ? '/admin/login' : '/connexion';
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Role check for admin routes
    const isAdminRoute = location.pathname.startsWith('/admin');
    const STAFF_ROLES = ['super_admin', 'admin', 'manager', 'guichetier', 'agent_embarquement', 'comptable'];

    if (isAdminRoute) {
        if (!STAFF_ROLES.includes(user.role)) {
            toast.error("Accès refusé : Vous n'avez pas les droits d'administration.");
            return <Navigate to="/" replace />;
        }
    }

    // Specific role requirement
    if (requiredRole === 'staff') {
        if (!STAFF_ROLES.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
