import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import React from "react";
import { Graph } from "react-d3-graph";

interface DependencyGraphProps {
  insights: PackageVersionInsight | null;
  packageName: string;
  packageVersion: string;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  insights,
  packageName,
  packageVersion,
}) => {
  if (!insights) {
    return <div>No insights available to render the graph.</div>;
  }

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

  return (
    <div className="w-full h-full min-h-[400px]">
      {nodes.length > 0 && (
        <Graph
          id="dependency-graph"
          data={{
            nodes: [
              {
                id: "0",
                label: `${packageName}@${packageVersion}`,
                color: "#dc2626",
              },
              ...nodes,
            ],
            links: edges,
          }}
          config={{
            nodeHighlightBehavior: true,
            node: {
              color: "#4f46e5",
              size: 300,
              highlightStrokeColor: "blue",
              labelProperty: "label",
            },
            link: {
              highlightColor: "lightblue",
            },
            height: window?.innerHeight ? window.innerHeight - 200 : 600,
            width: window?.innerWidth ? window.innerWidth - 100 : 800,
            directed: true,
            d3: {
              gravity: -400,
              linkLength: 200,
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
