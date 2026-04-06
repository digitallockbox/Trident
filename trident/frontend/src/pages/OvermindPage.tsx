import { FC } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GradientTitle from '../components/ui/GradientTitle';
import { useOvermind } from '../state/hooks/useOvermind';

const OvermindPage: FC = () => {
  const { data, loading, execute } = useOvermind();

  return (
    <div className="container mx-auto px-4 py-12">
      <GradientTitle text="Overmind Engine" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">Collective intelligence processing.</p>
      <GlassCard title="Overmind Status">
        <button onClick={() => execute({})} disabled={loading} className="px-4 py-2 bg-cyan-500 rounded text-white">
          {loading ? 'Collective...' : 'Process'}
        </button>
        {data && <pre className="mt-4 bg-slate-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>}
      </GlassCard>
    </div>
  );
};

export default OvermindPage;
