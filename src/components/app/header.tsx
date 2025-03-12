"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

type Tool = {
  name: string;
  path: string;
  emoji?: string;
};

const tools: Tool[] = [
  { name: "OSS Package Security Insight", path: "/", emoji: "🔍" },
  { name: "vet Report Visualization", path: "/vr", emoji: "📊" },
  { name: "vet GitHub Actions PR Bot", path: "/gha", emoji: "🤖" },
];

export default function Header() {
  const pathname = usePathname();

  // Find the current tool based on the pathname
  const currentTool =
    tools.find((tool) =>
      tool.path === "/" ? pathname === "/" : pathname.startsWith(tool.path),
    ) || tools[0];

  return (
    <header className="border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-lg font-bold text-gray-900 mr-8">
            🚀 vet
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 focus:outline-none">
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">
              {currentTool.emoji} {currentTool.name}
            </span>
            <span className="inline sm:hidden">{currentTool.emoji}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100 shadow-lg" align="end">
            {tools.map((tool) => (
              <DropdownMenuItem key={tool.path} asChild>
                <Link href={tool.path} className="w-full">
                  <span className="mr-2">{tool.emoji}</span>
                  {tool.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
