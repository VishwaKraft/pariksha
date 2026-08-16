import dynamic from 'next/dynamic';
const Questions = dynamic(() => import('../../src/components/questions'), { ssr: false });


export default function StudentQuestions() {
  return <Questions />;
}
