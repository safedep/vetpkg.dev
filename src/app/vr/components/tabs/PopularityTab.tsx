import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PackageData } from "../../types";
import { DataTable } from "../DataTable";
import { Badge } from "@/components/ui/badge";

interface ProjectInfo {
  packageName: string;
  packageVersion: string;
  projectName: string;
  stars: number;
  url: string;
}

const popularityColumns: ColumnDef<ProjectInfo>[] = [
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
    accessorKey: "projectName",
    header: "Project Name",
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: "stars",
    header: "Stars",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const stars = row.original.stars ?? 0;
      let badgeColor = "bg-gray-200"; // default color

      if (stars > 500) {
        badgeColor = "bg-green-200";
      } else if (stars > 100) {
        badgeColor = "bg-blue-200";
      } else if (stars >= 50) {
        badgeColor = "bg-yellow-200";
      } else if (stars >= 10) {
        badgeColor = "bg-orange-200";
      } else {
        badgeColor = "bg-red-200";
      }

      return <Badge className={`${badgeColor} text-black`}>{stars}</Badge>;
    },
  },
];

interface PopularityTabProps {
  data: PackageData[];
}

export function PopularityTab({ data }: PopularityTabProps) {
  const projects = data.flatMap(
    (pkg) =>
      pkg.projects?.map((p) => ({
        packageName: pkg.package.name,
        packageVersion: pkg.package.version,
        projectName: p.name,
        stars: p.stars,
        url: p.url,
      })) ?? [],
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={popularityColumns} data={projects} />
      </CardContent>
    </Card>
  );
}
