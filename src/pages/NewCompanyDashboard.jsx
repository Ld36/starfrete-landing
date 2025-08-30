import { Router, Route, Switch, useLocation } from "wouter";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../hooks/use-auth';
import ClientLayout from '../components/layouts/ClientLayout';
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
      <ClientLayout>
        <Switch>
          <Route path="/company-dashboard" component={DashboardOverview} />
          <Route path="/publish" component={PublishFreightPage} />
          <Route path="/freights" component={MyFreightsPage} />
          <Route path="/tracking" component={TrackingPage} />
          <Route path="/documents" component={DocumentsPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={DashboardOverview} /> {/* Fallback */}
        </Switch>
      </ClientLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default NewCompanyDashboard;
