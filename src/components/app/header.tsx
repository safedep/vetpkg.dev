"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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

function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch("https://api.github.com/repos/safedep/vet");
        const data = await res.json();
        setStars(data.stargazers_count);
      } catch (error) {
        console.error("Failed to fetch stars:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, []);

  return (
    <Link
      href="https://github.com/safedep/vet"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm hover:opacity-90 transition-opacity group"
    >
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
        <span className="font-medium">
          {loading ? "..." : stars?.toLocaleString()}
        </span>
      </div>
      <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
        Like this? Star us on GitHub
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely set mounted to true
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the current tool based on the pathname
  const currentTool =
    tools.find((tool) =>
      tool.path === "/" ? pathname === "/" : pathname.startsWith(tool.path),
    ) || tools[0];

  return (
    <header className="border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 dark:text-gray-100 mr-8"
          >
            🚀 vet
          </Link>
          {mounted && <GitHubStars />}
        </div>

        <div className="flex items-center">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
              className="mr-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentTool.emoji} {currentTool.name}
              </span>
              <span className="inline sm:hidden">{currentTool.emoji}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-gray-100 dark:bg-gray-800 shadow-lg"
              align="end"
            >
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
      </div>
    </header>
  );
}
