const ManageQuestion = dynamic(() => import('../../../src/components/admin/question/Manage'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminManageQuestion() {
  return (
    <AdminDashboard>
      <ManageQuestion />
    </AdminDashboard>
  );
}
