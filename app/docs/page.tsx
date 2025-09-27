import React from "react";
import { DocViewer } from "./_components/DocViewer";
import { Shell } from "./_components/Shell";
import DocsDashboard from "./_components/DocsDashboard";

export default async function DocsPage() {
  return (
    <Shell>
      <DocsDashboard />
    </Shell>
  );
}
