"use client";

import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[Docs ErrorBoundary]", { error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="text-sm text-zinc-600 mt-1">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}


