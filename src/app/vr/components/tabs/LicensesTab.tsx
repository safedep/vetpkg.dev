import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";

interface License {
  id: string;
  packageName: string;
  packageVersion: string;
}

const licenseColumns: ColumnDef<License>[] = [
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
    header: "License Code",
    enableSorting: true,
    enableColumnFilter: true,
  },
];

interface LicensesTabProps {
  data: PackageData[];
}

export function LicensesTab({ data }: LicensesTabProps) {
  const licenses = data.flatMap(
    (pkg) =>
      pkg.licenses?.map((l) => ({
        packageName: pkg.package.name,
        packageVersion: pkg.package.version,
        id: l.id,
      })) ?? [],
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={licenseColumns} data={licenses} />
      </CardContent>
    </Card>
  );
}
