import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

const violationColumns: ColumnDef<PackageData>[] = [
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
    accessorKey: "violations",
    header: "Policy Violations",
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const violations = row.original.violations || [];
      return violations.map((v, i) => (
        <div key={i} className="mb-2">
          <p className="font-medium">{v.check_type}</p>
          <p className="text-sm text-muted-foreground">{v.filter.summary}</p>
        </div>
      ));
    },
  },
];

interface ViolationsTabProps {
  data: PackageData[];
}

export function ViolationsTab({ data }: ViolationsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={violationColumns} data={data} />
      </CardContent>
    </Card>
  );
}
