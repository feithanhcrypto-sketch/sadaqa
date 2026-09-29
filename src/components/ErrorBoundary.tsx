import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Application error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
          <div className="max-w-md text-center">
            <h1 className="mb-2 text-xl font-bold text-gray-900">
              Une erreur est survenue
            </h1>
            <p className="text-gray-500">
              Veuillez rafraîchir la page. Si le problème persiste, réessayez dans quelques instants.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
