import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Requires an activeProfile to be selected.
 * If the user is authenticated but hasn't picked a profile yet,
 * redirects them to /profile-select.
 */
const ProfileGuard = () => {
  const { activeProfile } = useAuth();
  return activeProfile ? <Outlet /> : <Navigate to="/profile-select" replace />;
};

export default ProfileGuard;
