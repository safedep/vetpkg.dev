import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

const licenseColumns: ColumnDef<PackageData>[] = [
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
    accessorKey: "licenses",
    header: "Licenses",
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const licenses = row.original.licenses || [];
      return licenses.map((l, i) => (
        <div key={i} className="mb-2">
          <p className="font-medium">{l.name}</p>
          <p className="text-sm text-muted-foreground">{l.description}</p>
        </div>
      ));
    },
  },
];

interface LicensesTabProps {
  data: PackageData[];
}

export function LicensesTab({ data }: LicensesTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={licenseColumns} data={data} />
      </CardContent>
    </Card>
  );
}
