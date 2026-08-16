const CreateTest = dynamic(() => import('../../../src/components/admin/test/Create'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminCreateTest() {
  return (
    <AdminDashboard>
      <CreateTest />
    </AdminDashboard>
  );
}
