import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Requires at least one activeProfile to be selected.
 * If the user is authenticated but hasn't picked any profiles yet,
 * redirects them to /profile-select.
 */
const ProfileGuard = () => {
  const { activeProfiles } = useAuth();
  return activeProfiles.length > 0 ? <Outlet /> : <Navigate to="/profile-select" replace />;
};

export default ProfileGuard;
