"use client";

import React from "react";

export type DocsIndexContextType = {
  index: {
    items: Array<{ id: string; title: string; project: string; tags: string[]; slug: string[]; filePath?: string }>;
    projects: string[];
    tags: string[];
  } | null;
};

const DocsIndexContext = React.createContext<DocsIndexContextType>({ index: null });

export function IndexProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = React.useState<DocsIndexContextType["index"]>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/docs/index", { cache: "no-store" });
        const json = await res.json();
        if (json.ok) setIndex(json.data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load docs index", e);
      }
    })();
  }, []);
  return <DocsIndexContext.Provider value={{ index }}>{children}</DocsIndexContext.Provider>;
}

export function useDocsIndex() {
  return React.useContext(DocsIndexContext);
}

