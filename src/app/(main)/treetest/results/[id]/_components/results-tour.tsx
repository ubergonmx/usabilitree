"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { RESULTS_TOUR_STEP_IDS } from "@/lib/constants";
import { TourAlertDialog, TourStep, useTour } from "@/components/tour";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

function TourContent({ title, description }: { title: string; description: string }) {
  // format description to support markdown like bold, underline, and italics.
  const formattedDescription = description
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p
        className="text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: formattedDescription }}
      />
    </div>
  );
}

interface TourResultsProps {
  actions: {
    [key: string]: () => void;
  };
  onComplete?: () => void;
}

export default function TourResults({ actions, onComplete }: TourResultsProps) {
  const [openTour, setOpenTour] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)"); // Tailwind's md breakpoint
  const { setSteps, updateElementPosition, setIsTourCompleted } = useTour();

  // Create a ref to store the updateElementPosition function to avoid dependency issues
  const updateElementPositionRef = useRef(updateElementPosition);
  updateElementPositionRef.current = updateElementPosition;

  // Reset tour completion state when this component mounts
  useEffect(() => {
    setIsTourCompleted(false);
    setTourStarted(false);
    // Scroll to top to ensure tour elements are visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setIsTourCompleted]);

  // Helper function to wait for element to be ready
  const waitForElement = async (selectorId: string, maxWait = 10000): Promise<void> => {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkElement = () => {
        const element = document.getElementById(selectorId);

        // if element isn't found yet, keep waiting
        if (!element) {
          // console.log(`Element ${selectorId} not found, waiting...`);
          if (Date.now() - startTime > maxWait) {
            // console.warn(`Timeout waiting for element ${selectorId}, proceeding anyway`);
            resolve();
            return;
          }
          setTimeout(checkElement, 100);
          return;
        }

        // If element is found, check if it has loaded content (not just skeletons)
        if (element) {
          // Check if there are any loading skeletons present
          const loadingSkeletons = element.querySelectorAll('[class*="skeleton"]');
          const skeletonElements = element.querySelectorAll(".animate-pulse");

          if (loadingSkeletons.length > 0 || skeletonElements.length > 0) {
            // console.log(`Still loading skeletons for ${selectorId}, waiting...`);
            setTimeout(checkElement, 100);
            return;
          }

          // Additional checks for different tab types
          if (selectorId === RESULTS_TOUR_STEP_IDS.PARTICIPANTS) {
            // For participants tab, wait for table content or "no participants" message
            const table = element.querySelector("table tbody tr");
            const emptyMessage = element.querySelector("h3"); // "No participants yet"

            if (table || emptyMessage) {
              // console.log(`Element ${selectorId} is ready with content`);
              resolve();
              return;
            }
          } else if (selectorId === RESULTS_TOUR_STEP_IDS.TASKS) {
            // For tasks tab, wait for accordion content
            const accordion = element.querySelector("[data-state]"); // Accordion component
            const emptyMessage = element.querySelector("h3"); // "No tasks" message

            if (accordion || emptyMessage) {
              // console.log(`Element ${selectorId} is ready with content`);
              resolve();
              return;
            }
          } else if (selectorId === RESULTS_TOUR_STEP_IDS.OVERVIEW) {
            // For overview tab, wait for cards with actual content
            const cards = element.querySelectorAll('[class*="card"]');
            if (cards.length > 0) {
              // console.log(`Element ${selectorId} is ready with content`);
              resolve();
              return;
            }
          } else {
            // For other tabs, just check if element exists and has some content
            if (element.children.length > 0) {
              // console.log(`Element ${selectorId} is ready`);
              resolve();
              return;
            }
          }
        }

        // Check timeout
        if (Date.now() - startTime > maxWait) {
          // console.warn(`Timeout waiting for element ${selectorId}, proceeding anyway`);
          resolve(); // Resolve anyway to prevent blocking
          return;
        }

        // Continue checking
        setTimeout(checkElement, 100);
      };

      checkElement();
    });
  };

  const steps: TourStep[] = useMemo(
    () => [
      {
        content: (
          <TourContent
            title="Overview"
            description="Get a high-level summary of your tree test results."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.OVERVIEW,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.OVERVIEW]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.OVERVIEW);
        },
      },
      {
        content: (
          <TourContent
            title="Participants"
            description="View individual participant responses and analyze their journey through your tree test."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.PARTICIPANTS,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.PARTICIPANTS]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.PARTICIPANTS, 1000);
        },
      },
      {
        content: (
          <TourContent
            title="Tasks Analysis"
            description="Dive deep into task-specific results, success rates, and participant paths through your tree structure."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.TASKS,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.TASKS]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.TASKS);
        },
      },
      {
        content: (
          <TourContent
            title="Expand Task Details"
            description="**Click** anywhere in this highlighted area to __expand__ the task and see detailed metrics and participant paths."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.TASKS_EXPAND,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.TASKS]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.TASKS_EXPAND, 20000);
        },
        onClickWithinArea: () => {
          actions.openFirstTask?.();
          // Update the highlighted area after accordion expands
          setTimeout(() => {
            updateElementPositionRef.current();
          }, 100);
        },
      },
      {
        content: (
          <TourContent
            title="Public Link & Sharing"
            description="Get public link for your participants to access the study. Add collaborators to share results."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.SHARING,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.SHARING]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.SHARING);
        },
      },
      {
        content: (
          <TourContent
            title="Quick Share Actions"
            description="You can also use the quick action buttons to copy or open the study link directly from the header."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.SHARING_QUICK_ACTION,
        position: isMobile ? "bottom" : "right",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.SHARING]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.SHARING);
        },
      },
      {
        content: (
          <TourContent
            title="Export Data"
            description="Download your results as an Excel file for further analysis or reporting."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.EXPORT,
        position: "top",
        onBeforeStep: async () => {
          actions[RESULTS_TOUR_STEP_IDS.EXPORT]?.();
          await waitForElement(RESULTS_TOUR_STEP_IDS.EXPORT);
        },
      },
      {
        content: (
          <TourContent
            title="Edit Study"
            description="Click here next to see how to configure your tree test study."
          />
        ),
        selectorId: RESULTS_TOUR_STEP_IDS.EDIT,
        position: "bottom",
      },
    ],
    [isMobile, actions]
  );

  useEffect(() => {
    setSteps(steps);
    const timer = setTimeout(() => {
      setOpenTour(true);
      setTourStarted(true);
    }, 500); // Increased delay to ensure elements are rendered

    return () => clearTimeout(timer);
  }, [setSteps, steps]);

  // Wrap onComplete to ensure it only fires when tour actually started
  const handleTourComplete = () => {
    if (tourStarted && onComplete) {
      onComplete();
    }
  };

  return (
    <TourAlertDialog
      isOpen={openTour}
      setIsOpen={setOpenTour}
      autoStart={true}
      onComplete={handleTourComplete}
    />
  );
}
