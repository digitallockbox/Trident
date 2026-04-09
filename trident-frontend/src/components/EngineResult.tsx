// Placeholder for EngineResult component
interface EngineResultProps {
  result: any;
}
export default function EngineResult({ result }: EngineResultProps) {
  return <div>EngineResult: {JSON.stringify(result)}</div>;
}
