import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[SyN] error de render:', error)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-lg">Se cortó algo</h1>
        <p className="text-sm text-ink-soft">
          Probá recargar. Si sigue pasando, contame en qué pantalla estabas.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Recargar
        </button>
        <pre className="max-w-full overflow-x-auto rounded-lg bg-surface-2 p-3 text-left text-[11px] text-ink-faint">
          {this.state.error.message}
        </pre>
      </div>
    )
  }
}
