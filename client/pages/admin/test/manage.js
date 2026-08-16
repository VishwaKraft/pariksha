const ManageTest = dynamic(() => import('../../../src/components/admin/test/Manage'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminManageTest() {
  return (
    <AdminDashboard>
      <ManageTest />
    </AdminDashboard>
  );
}
