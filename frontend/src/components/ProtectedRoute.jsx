import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Add role-based routing if needed
  if (user?.role === 'admin' && !window.location.pathname.includes('/users/admin/')) {
    return <Navigate to={`/users/admin/${user._id}/dashboard`} replace />;
  }

  if (user?.role === 'mentor' && !window.location.pathname.includes('/users/mentors/')) {
    return <Navigate to={`/users/mentors/${user._id}/dashboard`} replace />;
  }

  return children;
}

export default ProtectedRoute; 