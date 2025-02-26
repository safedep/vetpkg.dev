import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

const popularityColumns: ColumnDef<PackageData>[] = [
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
    accessorKey: "package.ecosystem",
    header: "Ecosystem",
    enableSorting: true,
    enableColumnFilter: true,
  },
];

interface PopularityTabProps {
  data: PackageData[];
}

export function PopularityTab({ data }: PopularityTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={popularityColumns} data={data} />
      </CardContent>
    </Card>
  );
}
