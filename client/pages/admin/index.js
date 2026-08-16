import dynamic from 'next/dynamic';
const Signin = dynamic(() => import('../../src/components/admin/Signin'), { ssr: false });


export default function AdminIndex() {
  return <Signin />;
}
