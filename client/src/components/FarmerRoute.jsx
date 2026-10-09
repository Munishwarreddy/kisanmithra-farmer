import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const FarmerRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || user?.role !== 'farmer') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default FarmerRoute;
