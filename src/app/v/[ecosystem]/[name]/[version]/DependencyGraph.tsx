import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import React, { useEffect, useState, memo } from "react";
import { Graph } from "react-d3-graph";
import type { GraphNode as D3GraphNode } from "react-d3-graph";
import { useTheme } from "next-themes";

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
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = theme === "dark" || resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [graphData, setGraphData] = useState<{
    nodes: CustomGraphNode[];
    links: { source: string; target: string }[];
  }>({ nodes: [], links: [] });

  // useEffect only runs on the client, so we can safely check for the theme
  useEffect(() => {
    setMounted(true);
  }, []);

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

    // Choose the color for the root node based on the theme
    const rootNodeColor = isDarkMode ? "#ef4444" : "#dc2626"; // lighter red for dark mode

    setGraphData({
      nodes: [
        {
          id: "0",
          label: `${packageName}@${packageVersion}`,
          color: rootNodeColor,
        },
        ...nodes,
      ],
      links: edges,
    });
  }, [insights, packageName, packageVersion, isDarkMode]);

  if (!insights) {
    return <div>No insights available to render the graph.</div>;
  }

  if (!mounted) {
    return <div className="w-full h-full min-h-[400px]">Loading graph...</div>;
  }

  // Define colors based on theme
  const nodeColor = isDarkMode ? "#818cf8" : "#6366f1"; // indigo-400 in dark mode, indigo-500 in light mode
  const highlightStrokeColor = isDarkMode ? "#60a5fa" : "#1d4ed8"; // blue-400 in dark mode, blue-700 in light mode
  const linkColor = isDarkMode ? "#6b7280" : "#94a3b8"; // gray-500 in dark mode, gray-400 in light mode
  const linkHighlightColor = isDarkMode ? "#60a5fa" : "#93c5fd"; // blue-400 in dark mode, blue-300 in light mode
  const textColor = isDarkMode ? "#f3f4f6" : "#1f2937"; // gray-100 in dark mode, gray-800 in light mode

  return (
    <div className="w-full h-full min-h-[400px]">
      {graphData.nodes.length > 0 && (
        <MemoizedGraph
          id="dependency-graph"
          data={graphData}
          config={{
            nodeHighlightBehavior: true,
            node: {
              color: nodeColor,
              size: 800,
              highlightStrokeColor: highlightStrokeColor,
              labelProperty: (node: D3GraphNode) =>
                (node as CustomGraphNode).label,
              fontSize: 16,
              fontWeight: "bold",
              strokeWidth: 3,
              fontColor: textColor,
            },
            link: {
              highlightColor: linkHighlightColor,
              color: linkColor,
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
