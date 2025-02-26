import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

const adviceColumns: ColumnDef<PackageData>[] = [
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
    accessorKey: "advices",
    header: "Recommendations",
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const advices = row.original.advices || [];
      return advices.map((a, i) => (
        <div key={i} className="mb-2">
          <p className="font-medium">{a.type}</p>
          <p className="text-sm text-muted-foreground">
            {a.target_package_version || a.target_alternate_package_version}
          </p>
        </div>
      ));
    },
  },
];

interface AdviceTabProps {
  data: PackageData[];
}

export function AdviceTab({ data }: AdviceTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={adviceColumns} data={data} />
      </CardContent>
    </Card>
  );
}
