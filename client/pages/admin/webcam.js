const WebcamMonitor = dynamic(() => import('../../src/components/admin/WebcamMonitor'), { ssr: false });
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(() => import('../../src/components/admin/Dashboard'), { ssr: false });



export default function AdminWebcam() {
  return (
    <AdminDashboard>
      <WebcamMonitor />
    </AdminDashboard>
  );
}
