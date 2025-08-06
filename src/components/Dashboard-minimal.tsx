// Minimal Dashboard component for testing
import { AuthState } from '../types';

interface DashboardProps {
  authState: AuthState;
}

const Dashboard: React.FC<DashboardProps> = ({ authState }) => {
  return <div>Dashboard</div>;
};

export default Dashboard;
