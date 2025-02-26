import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

const vulnerabilityColumns: ColumnDef<PackageData>[] = [
  {
    accessorKey: "package.name",
    header: "Package Name",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "package.version",
    header: "Version",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "vulnerabilities",
    header: "Vulnerabilities",
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const vulns = row.original.vulnerabilities || [];
      return vulns.map((v, i) => (
        <div key={i} className="mb-2">
          <p className="font-medium text-destructive">{v.severity}</p>
          <p className="text-sm">{v.description}</p>
        </div>
      ));
    },
  },
];

interface VulnerabilitiesTabProps {
  data: PackageData[];
}

export function VulnerabilitiesTab({ data }: VulnerabilitiesTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={vulnerabilityColumns} data={data} />
      </CardContent>
    </Card>
  );
}
