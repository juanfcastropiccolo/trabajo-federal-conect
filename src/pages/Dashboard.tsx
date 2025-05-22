
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import WorkerDashboard from '../components/WorkerDashboard';
import CompanyDashboard from '../components/CompanyDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { jobs, applications } = useData();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {user.role === 'worker' && (
        <WorkerDashboard user={user} jobs={jobs} applications={applications} />
      )}
      
      {user.role === 'company' && (
        <CompanyDashboard user={user} jobs={jobs} applications={applications} />
      )}
    </div>
  );
};

export default Dashboard;
