import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";
import { Badge } from "@/components/ui/badge";

interface VulnerabilityEntry {
  id: string;
  packageName: string;
  packageVersion: string;
  title: string;
  severity: string;
  aliases: string[];
}

const vulnerabilityColumns: ColumnDef<VulnerabilityEntry>[] = [
  {
    accessorKey: "packageName",
    header: "Package Name",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "packageVersion",
    header: "Version",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "id",
    header: "Vulnerability ID",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      return (
        <a
          href={`https://osv.dev/vulnerability/${row.original.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap"
        >
          ⚠️ {row.original.id}
        </a>
      );
    },
  },
  {
    accessorKey: "aliases",
    header: "Aliases",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      return row.original.aliases?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {row.original.aliases.map((alias) => (
            <Badge key={alias} variant="outline">
              {alias}
            </Badge>
          ))}
        </div>
      ) : (
        "No aliases"
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: "severity",
    header: "Severity",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className={
            row.original.severity === "CRITICAL"
              ? "bg-red-600 text-white"
              : row.original.severity === "HIGH"
                ? "bg-red-400 text-white"
                : row.original.severity === "MEDIUM"
                  ? "bg-yellow-500 text-black"
                  : row.original.severity === "LOW"
                    ? "bg-green-500 text-black"
                    : ""
          }
        >
          {row.original.severity || "Unknown"}
        </Badge>
      );
    },
  },
];

interface VulnerabilitiesTabProps {
  data: PackageData[];
}

export function VulnerabilitiesTab({ data }: VulnerabilitiesTabProps) {
  const vulnerabilityEntries = data.flatMap(
    (pkg) =>
      pkg.vulnerabilities?.map((vuln) => ({
        packageName: pkg.package.name,
        packageVersion: pkg.package.version,
        id: vuln.id,
        title: vuln.title,
        severity: vuln.severities?.length > 0 ? vuln.severities[0].risk : "",
        aliases: vuln.aliases,
      })) ?? [],
  );

  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  vulnerabilityEntries.sort((a, b) => {
    const aIndex = severityOrder.indexOf(a.severity);
    const bIndex = severityOrder.indexOf(b.severity);
    return (
      (aIndex === -1 ? severityOrder.length : aIndex) -
      (bIndex === -1 ? severityOrder.length : bIndex)
    );
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={vulnerabilityColumns} data={vulnerabilityEntries} />
      </CardContent>
    </Card>
  );
}
