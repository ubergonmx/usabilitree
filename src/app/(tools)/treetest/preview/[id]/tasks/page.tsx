import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";
import { shuffle } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TreeTestPage({ params }: { params: { id: string } }) {
  const config = await loadTestConfig(params.id, true);
  const tasks = config.randomizeTasks ? shuffle(config.tasks) : config.tasks;

  return <TreeTestComponent config={{ ...config, tasks }} />;
}
