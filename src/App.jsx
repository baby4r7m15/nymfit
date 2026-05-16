import React, { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { UserProvider } from '@/lib/UserContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LoginScreen from '@/components/LoginScreen';
import Layout from '@/components/Layout';
import InstallBanner from '@/components/InstallBanner';
import PwaGuard from '@/components/PwaGuard';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-loaded pages
const Landing        = lazy(() => import('@/pages/Landing'));
const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const TransDashboard = lazy(() => import('@/pages/TransDashboard'));
const FemmeDashboard = lazy(() => import('@/pages/FemmeDashboard'));
const Workouts       = lazy(() => import('@/pages/Workouts'));
const Tracker        = lazy(() => import('@/pages/Tracker'));
const Profile        = lazy(() => import('@/pages/Profile'));
const Community      = lazy(() => import('@/pages/Community'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const BodyProgress   = lazy(() => import('@/pages/BodyProgress'));
const TestSite       = lazy(() => import('@/pages/TestSite'));

const pageVariants = {
  initial:  { opacity: 0, x: 18 },
  animate:  { opacity: 1, x: 0,  transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, x: -18, transition: { duration: 0.16, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="font-display text-2xl text-primary animate-pulse">NymFit</div>
          </div>
        }>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/trans-dashboard" element={<TransDashboard />} />
              <Route path="/femme-dashboard" element={<FemmeDashboard />} />
              <Route path="/tracker"        element={<Tracker />} />
              <Route path="/workouts"       element={<Workouts />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/community"      element={<Community />} />
              <Route path="/body-progress"  element={<BodyProgress />} />
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/test-site"      element={<TestSite />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function DynamicFavicon() {
  useEffect(() => {
    const load = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        const notes = await base44.entities.AdminNote.list();
        const note = notes.find(n => n.title === 'app_icon');
        if (note?.content) {
          document.querySelectorAll('link[rel~="icon"], link[rel~="apple-touch-icon"]').forEach(el => {
            el.href = note.content;
          });
        }
      } catch (e) {}
    };
    load();
  }, []);
  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sniff-gradient">
        <div className="font-display text-3xl text-primary animate-pulse">NymFit</div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') return <LoginScreen />;
  }

  return (
    <PwaGuard>
      <AnimatedRoutes />
    </PwaGuard>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <UserProvider>
            <AuthenticatedApp />
          </UserProvider>
        </Router>
        <DynamicFavicon />
        <InstallBanner />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;