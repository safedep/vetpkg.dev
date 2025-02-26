import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

interface Violation {
  packageName: string;
  packageVersion: string;
  checkType: string;
  name: string;
  summary: string;
  value: string;
}

const violationColumns: ColumnDef<Violation>[] = [
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
    accessorKey: "checkType",
    header: "Check Type",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: "summary",
    header: "Summary",
    enableSorting: true,
    enableColumnFilter: false,
  },
];

interface ViolationsTabProps {
  data: PackageData[];
}

export function ViolationsTab({ data }: ViolationsTabProps) {
  const violations = data.flatMap(
    (pkg) =>
      pkg.violations?.map((v) => ({
        packageName: pkg.package.name,
        packageVersion: pkg.package.version,
        checkType: v.check_type,
        name: v.filter.name,
        summary: v.filter.summary,
        value: v.filter.value,
      })) ?? [],
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={violationColumns} data={violations} />
      </CardContent>
    </Card>
  );
}
