import dynamic from 'next/dynamic';
const Feedback = dynamic(() => import('../../src/components/feedback'), { ssr: false });


export default function StudentFeedback() {
  return <Feedback />;
}
