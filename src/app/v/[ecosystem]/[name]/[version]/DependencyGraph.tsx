import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import React, { useEffect, useState, memo } from "react";
import { Graph } from "react-d3-graph";
import type { GraphNode as D3GraphNode } from "react-d3-graph";

interface DependencyGraphProps {
  insights: PackageVersionInsight | null;
  packageName: string;
  packageVersion: string;
}

// Extend the base GraphNode type from react-d3-graph
interface CustomGraphNode extends D3GraphNode {
  label: string;
  color?: string;
}

// Memoized Graph component to prevent unnecessary re-renders
const MemoizedGraph = memo(Graph);

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  insights,
  packageName,
  packageVersion,
}) => {
  const [graphData, setGraphData] = useState<{
    nodes: CustomGraphNode[];
    links: { source: string; target: string }[];
  }>({ nodes: [], links: [] });

  useEffect(() => {
    if (!insights) return;

    // Extract dependency data from insights
    const graph = insights.dependencyGraph || {
      dependencies: [],
      dependencyRelations: [],
    };

    // Prepare data for the graph rendering library
    const nodes = graph.dependencies.map((dep, index) => ({
      id: index.toString(),
      label: `${dep.packageVersion?.package?.name}@${dep.packageVersion?.version}`,
    }));

    const edges = graph.dependencyRelations.map((relation) => ({
      source: relation.from.toString(),
      target: relation.to.toString(),
    }));

    setGraphData({
      nodes: [
        {
          id: "0",
          label: `${packageName}@${packageVersion}`,
          color: "#dc2626",
        },
        ...nodes,
      ],
      links: edges,
    });
  }, [insights, packageName, packageVersion]);

  if (!insights) {
    return <div>No insights available to render the graph.</div>;
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      {graphData.nodes.length > 0 && (
        <MemoizedGraph
          id="dependency-graph"
          data={graphData}
          config={{
            nodeHighlightBehavior: true,
            node: {
              color: "#6366f1",
              size: 800,
              highlightStrokeColor: "#1d4ed8",
              labelProperty: (node: D3GraphNode) =>
                (node as CustomGraphNode).label,
              fontSize: 16,
              fontWeight: "bold",
              strokeWidth: 3,
            },
            link: {
              highlightColor: "#93c5fd",
              color: "#94a3b8",
              strokeWidth: 2,
            },
            height: window?.innerHeight ? window.innerHeight - 100 : 800,
            width: window?.innerWidth ? window.innerWidth - 50 : 1000,
            directed: true,
            d3: {
              gravity: -600,
              linkLength: 250,
              linkStrength: 1,
              disableLinkForce: false,
              alphaTarget: 0.05,
            },
            automaticRearrangeAfterDropNode: true,
            staticGraph: false,
            collapsible: true,
          }}
        />
      )}
    </div>
  );
};

export default DependencyGraph;
