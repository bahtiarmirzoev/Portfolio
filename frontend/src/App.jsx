import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Home from './components/Home';
import Profile from './components/profile/Profile';
import MoviesList from './components/movies/MoviesList';
import MovieDetail from './components/movies/MovieDetail';
import SeriesList from './components/series/SeriesList';
import SeriesDetail from './components/series/SeriesDetail';
import ActorsList from './components/actors/ActorsList';
import ActorDetail from './components/actors/ActorDetail';
import AdminPanel from './components/admin/AdminPanel';
import Layout from './components/layout/Layout';
import AiAssistant from './components/ai/AiAssistant';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);


  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);


  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }


  return isAuthenticated ? children : <Navigate to="/sign-in" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);


  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);


  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);


  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);


  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }


  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  return children;
};

function AppRoutes() {
  return (
    <Routes>
        <Route
          path="/sign-in"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/movies"
          element={
            <Layout>
              <MoviesList />
            </Layout>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <Layout>
              <MovieDetail />
            </Layout>
          }
        />
        <Route
          path="/series"
          element={
            <Layout>
              <SeriesList />
            </Layout>
          }
        />
        <Route
          path="/series/:id"
          element={
            <Layout>
              <SeriesDetail />
            </Layout>
          }
        />
        <Route
          path="/actors"
          element={
            <Layout>
              <ActorsList />
            </Layout>
          }
        />
        <Route
          path="/actors/:id"
          element={
            <Layout>
              <ActorDetail />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
      <AiAssistant />
    </Router>
  );
}

export default App;

