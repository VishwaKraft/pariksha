const CreateQuestion = dynamic(() => import('../../../src/components/admin/question/Create'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminCreateQuestion() {
  return (
    <AdminDashboard>
      <CreateQuestion />
    </AdminDashboard>
  );
}
