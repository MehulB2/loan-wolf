import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './hooks/useGameStore';
import StartScreen from './components/StartScreen';
import Dashboard from './components/Dashboard';
import GameOver from './components/GameOver';

function App() {
  const phase = useGameStore(s => s.phase);
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-200 font-mono">
      <AnimatePresence mode="wait">
        {phase === 'start' && <StartScreen key="start" />}
        {(phase === 'playing' || phase === 'resolving') && <Dashboard key="dashboard" />}
        {phase === 'gameover' && <GameOver key="gameover" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
