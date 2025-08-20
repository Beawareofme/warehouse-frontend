import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error("ErrorBoundary:", error, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
            <p className="text-sm text-gray-400 mb-4">{String(this.state.error || "Unknown error")}</p>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
