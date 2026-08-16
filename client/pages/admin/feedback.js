const Feedback = dynamic(() => import('../../src/components/admin/Feedback'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminFeedback() {
  return (
    <AdminDashboard>
      <Feedback />
    </AdminDashboard>
  );
}
