import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SignIn from './pages/signin/SignIn';
import ForgetPassword from './pages/forgetpassword/ForgetPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Welcome from './pages/Dashboard/Welcome';
import AllTiles from './pages/Tiles/AllTiles';
import AddTiles from './pages/Tiles/AddTiles';
import TileCategories from './pages/Tiles/TileCategories';
import TileColors from './pages/Tiles/TileColors';
import Submissions from './pages/Tiles/Submissions';
import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from './components/Loader';

const DashboardLayout = ({ children }) => {
  return (
    <section className='w-full min-h-screen overflow-hidden'>
      <Navbar />
    <div className="flex">
      <Sidebar />
        <main className="w-full   bg-gray-100">
          {children}
        </main>
    </div>
    </section>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

const AppRoutes = () => {
  const { isAuthChecked } = useAuth();

   if (!isAuthChecked) {
    return <Loader />;
   }  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
     <Route path='reset-password/:token' element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Welcome />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/tiles"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AllTiles />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/add-tile"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AddTiles />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/categories"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <TileCategories />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/colors"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <TileColors />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/submissions"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Submissions />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
