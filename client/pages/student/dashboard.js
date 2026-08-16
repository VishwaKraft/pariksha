import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('../../src/components/dashboard'), { ssr: false });


export default function StudentDashboard() {
  return <Dashboard />;
}
