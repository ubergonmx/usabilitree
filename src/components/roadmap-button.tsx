"use client";

import { DASHBOARD_TOUR_STEP_IDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { RocketIcon } from "@/components/icons";

interface RoadmapButtonProps {
  className?: string;
  variant?: "header" | "nav";
}

export function RoadmapButton({ className, variant = "nav" }: RoadmapButtonProps) {
  const handleRoadmapClick = () => {
    window.open("https://usabilitree.userjot.com/roadmap", "_blank", "noopener,noreferrer");
  };

  if (variant === "header") {
    return (
      <button
        id={DASHBOARD_TOUR_STEP_IDS.ROADMAP + "-mob"}
        onClick={handleRoadmapClick}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground md:hidden",
          className
        )}
        title="View Roadmap"
      >
        <RocketIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      id={DASHBOARD_TOUR_STEP_IDS.ROADMAP}
      onClick={handleRoadmapClick}
      className={cn(
        "hidden items-center whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground md:flex",
        className
      )}
      title="View Roadmap"
    >
      <RocketIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span>Roadmap</span>
    </button>
  );
}
