"use client";

import { MessageSquareCodeIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { DASHBOARD_TOUR_STEP_IDS } from "@/lib/constants";

interface FeedbackButtonProps {
  className?: string;
  variant?: "header" | "nav";
}

export function FeedbackButton({ className, variant = "nav" }: FeedbackButtonProps) {
  const handleFeedbackClick = (): void => {
    // Open UserJot widget for feedback
    if (typeof window !== "undefined" && window.uj) {
      window.uj.showWidget();
    }
  };

  if (variant === "header") {
    return (
      <Button
        id={DASHBOARD_TOUR_STEP_IDS.FEEDBACK + "-mob"}
        onClick={handleFeedbackClick}
        className={cn(
          "items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground md:hidden",
          className
        )}
        variant={"outline"}
      >
        <MessageSquareCodeIcon className="h-4 w-4" />
        Feedback
      </Button>
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
