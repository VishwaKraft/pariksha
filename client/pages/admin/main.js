import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../src/components/admin/Dashboard'), { ssr: false });
const Main = dynamic(() => import('../../src/components/admin/Main'), { ssr: false });

export default function AdminMain() {
  return (
    <AdminDashboard>
      <Main />
    </AdminDashboard>
  );
}
