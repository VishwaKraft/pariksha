const User = dynamic(() => import('../../src/components/admin/User'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminUser() {
  return (
    <AdminDashboard>
      <User />
    </AdminDashboard>
  );
}
