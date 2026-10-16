import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { WorkerLayout } from './components/layout/WorkerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PortalSelectPage } from './pages/public/PortalSelectPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';
import { CommissionPage } from './pages/public/CommissionPage';
import { ContactPage } from './pages/public/ContactPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PostDealWizard } from './pages/customer/PostDealWizard';
import { DealDetailsPage } from './pages/customer/DealDetailsPage';
import { QuotationComparisonMatrix } from './pages/customer/QuotationComparisonMatrix';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { WorkersDirectoryPage } from './pages/customer/WorkersDirectoryPage';
import { WorkerProfilePage } from './pages/customer/WorkerProfilePage';
import { CustomerWalletPage } from './pages/customer/CustomerWalletPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerFeedPage } from './pages/worker/WorkerFeedPage';
import { SubmitQuotationPage } from './pages/worker/SubmitQuotationPage';
import { WorkerQuotesPage } from './pages/worker/WorkerQuotesPage';
import { WorkerProjectsPage } from './pages/worker/WorkerProjectsPage';
import { WorkerProfileManagePage } from './pages/worker/WorkerProfileManagePage';
import { WorkerEarningsPage } from './pages/worker/WorkerEarningsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminEscrowDeliveriesPage } from './pages/admin/AdminEscrowDeliveriesPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';

// Shared Pages
import { LiveChatPage } from './pages/shared/LiveChatPage';

// Public Layout Wrapper with Sticky Navbar & Footer
const PublicLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-white">
    <Navbar />
    <main className="flex-1 bg-white">{children}</main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC PAGES */}
            <Route
              path="/"
              element={
                <PublicLayoutWrapper>
                  <LandingPage />
                </PublicLayoutWrapper>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayoutWrapper>
                  <AboutPage />
                </PublicLayoutWrapper>
              }
            />
            <Route
              path="/commission"
              element={
                <PublicLayoutWrapper>
                  <CommissionPage />
                </PublicLayoutWrapper>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayoutWrapper>
                  <ContactPage />
                </PublicLayoutWrapper>
              }
            />
            <Route
              path="/terms"
              element={
                <PublicLayoutWrapper>
                  <AboutPage />
                </PublicLayoutWrapper>
              }
            />
            <Route
              path="/privacy"
              element={
                <PublicLayoutWrapper>
                  <AboutPage />
                </PublicLayoutWrapper>
              }
            />
            <Route path="/portal-select" element={<PortalSelectPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage defaultRole="admin" />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* CUSTOMER PORTAL */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRole="CUSTOMER">
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="deals" element={<CustomerDashboard />} />
              <Route path="deals/new" element={<PostDealWizard />} />
              <Route path="deals/feed" element={<WorkerFeedPage />} />
              <Route path="deals/:id" element={<DealDetailsPage />} />
              <Route path="deals/:id/compare" element={<QuotationComparisonMatrix />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="workers" element={<WorkersDirectoryPage />} />
              <Route path="workers/:id" element={<WorkerProfilePage />} />
              <Route path="wallet" element={<CustomerWalletPage />} />
              <Route path="chat" element={<LiveChatPage />} />
            </Route>

            {/* WORKER PORTAL */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRole="WORKER">
                  <WorkerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/worker/dashboard" replace />} />
              <Route path="dashboard" element={<WorkerDashboard />} />
              <Route path="feed" element={<WorkerFeedPage />} />
              <Route path="deals/:id/quote" element={<SubmitQuotationPage />} />
              <Route path="quotes" element={<WorkerQuotesPage />} />
              <Route path="projects" element={<WorkerProjectsPage />} />
              <Route path="earnings" element={<WorkerEarningsPage />} />
              <Route path="profile" element={<WorkerProfileManagePage />} />
              <Route path="chat" element={<LiveChatPage />} />
            </Route>

            {/* ADMIN PORTAL */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="escrow" element={<AdminEscrowDeliveriesPage />} />
              <Route path="disputes" element={<AdminDisputesPage />} />
              <Route path="users" element={<AdminVerificationsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="audit" element={<AdminEscrowDeliveriesPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
