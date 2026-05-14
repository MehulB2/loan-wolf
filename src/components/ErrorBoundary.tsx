import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full rounded-xl border border-[#FF3366]/40 bg-[#FF3366]/5 p-6">
            <div className="text-[#FF3366] font-mono font-bold text-lg mb-3">Runtime Error</div>
            <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap bg-[#141824] rounded-lg p-4 overflow-auto max-h-96">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
