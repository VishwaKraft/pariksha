import dynamic from 'next/dynamic';
const Signup = dynamic(() => import('../src/components/registration'), { ssr: false });


export default function SignupPage() {
  return <Signup />;
}
