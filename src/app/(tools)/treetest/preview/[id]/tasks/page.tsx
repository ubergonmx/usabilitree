import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";

export const dynamic = "force-dynamic";

export default async function TreeTestPage({ params }: { params: { id: string } }) {
  const config = await loadTestConfig(params.id, true);

  if (config.randomizeTasks) {
    const shuffled = [...config.tasks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return <TreeTestComponent config={{ ...config, tasks: shuffled }} />;
  }

  return <TreeTestComponent config={config} />;
}
