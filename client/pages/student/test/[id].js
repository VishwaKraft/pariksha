import dynamic from 'next/dynamic';
const Instruction = dynamic(() => import('../../../src/components/instruction'), { ssr: false });


export default function StudentTestInstruction() {
  return <Instruction />;
}
