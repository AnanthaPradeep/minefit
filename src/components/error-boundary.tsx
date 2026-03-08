import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MineFit runtime error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
        <h2 className="text-base font-semibold">Something went wrong on this screen</h2>
        <p className="mt-2">{this.state.message || "Unexpected runtime error"}</p>
        <button
          className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-white"
          onClick={() => window.location.reload()}
        >
          Reload App
        </button>
      </div>
    );
  }
}
