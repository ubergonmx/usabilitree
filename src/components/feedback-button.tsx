"use client";

import { MessageSquareCodeIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { DASHBOARD_TOUR_STEP_IDS } from "@/lib/constants";

interface FeedbackButtonProps {
  className?: string;
  variant?: "header" | "nav";
}

export function FeedbackButton({ className, variant = "nav" }: FeedbackButtonProps) {
  const handleFeedbackClick = (): void => {
    // Open UserJot widget for feedback, fallback to URL if SDK failed to load
    if (typeof window !== "undefined" && window.__ujLoaded && window.uj?.showWidget) {
      try {
        window.uj.showWidget();
      } catch {
        window.open("https://usabilitree.userjot.com/", "_blank", "noopener,noreferrer");
      }
    } else {
      window.open("https://usabilitree.userjot.com/", "_blank", "noopener,noreferrer");
    }
  };

  if (variant === "header") {
    return (
      <button
        id={DASHBOARD_TOUR_STEP_IDS.FEEDBACK + "-mob"}
        onClick={handleFeedbackClick}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground md:hidden",
          className
        )}
        title="Give Feedback"
      >
        <MessageSquareCodeIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      id={DASHBOARD_TOUR_STEP_IDS.FEEDBACK}
      onClick={handleFeedbackClick}
      className={cn(
        "hidden items-center whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground md:flex",
        className
      )}
    >
      <MessageSquareCodeIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span>Give Feedback</span>
    </button>
  );
}
