import { Router, Route, Switch, useLocation } from "wouter";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../hooks/use-auth';
import ClientLayout from '../components/layouts/ClientLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardOverview from './DashboardOverview';
import PublishFreightPage from './PublishFreightPage';
import MyFreightsPage from './MyFreightsPage';
import TrackingPage from './TrackingPage';
import DocumentsPage from './DocumentsPage';
import MessagesPage from './MessagesPage';
import SettingsPage from './SettingsPage';

const NewCompanyDashboard = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ClientLayout>
          <Switch>
            <Route path="/company-dashboard" component={DashboardOverview} />
            <Route path="/publish" component={PublishFreightPage} />
            <Route path="/freights" component={() => (
              <ErrorBoundary>
                <MyFreightsPage />
              </ErrorBoundary>
            )} />
            <Route path="/tracking" component={TrackingPage} />
            <Route path="/documents" component={DocumentsPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={DashboardOverview} /> {/* Fallback */}
          </Switch>
        </ClientLayout>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default NewCompanyDashboard;
