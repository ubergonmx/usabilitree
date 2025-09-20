"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_TOUR_STEP_IDS } from "@/lib/constants";
import { TourAlertDialog, TourStep, useTour } from "@/components/tour";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

function TourContent({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function TourDashboard() {
  const router = useRouter();
  const [openTour, setOpenTour] = useState(false);
  const [hasShownTour, setHasShownTour] = useState(false);
  const [isTourCompletedInStorage, setIsTourCompletedInStorage] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)"); // Tailwind's md breakpoint
  const { setSteps } = useTour();

  // Check localStorage for tour completion status
  useEffect(() => {
    const tourCompleted = localStorage.getItem("dashboard-tour-completed");
    setIsTourCompletedInStorage(tourCompleted === "true");
  }, []);

  const steps: TourStep[] = useMemo(
    () => [
      {
        content: (
          <TourContent
            title="Sample Study"
            description="Take a look at this sample active study and get onboarded on how tree testing works in this platform."
          />
        ),
        selectorId: DASHBOARD_TOUR_STEP_IDS.SAMPLE_STUDY,
        position: isMobile ? "top" : "bottom",
        onClickWithinArea: () => {},
      },
      {
        content: (
          <TourContent
            title="Recent Updates"
            description="Check recent updates and development messages here."
          />
        ),
        selectorId: DASHBOARD_TOUR_STEP_IDS.UPDATES,
        position: isMobile ? "bottom" : "right", // Change to bottom on mobile
        onClickWithinArea: () => {},
      },
      {
        content: (
          <TourContent
            title="Got any questions?"
            description="Send your complaints, feedback, or feature requests here. This will help me improve this tool!"
          />
        ),
        selectorId: DASHBOARD_TOUR_STEP_IDS.FEEDBACK + (isMobile ? "-mob" : ""),
        position: isMobile ? "bottom" : "right", // Change to bottom on mobile
        onClickWithinArea: () => {},
      },
      {
        content: (
          <TourContent
            title="Feeling generous?"
            description="If this tool helped you, consider buying me a coffee to support the development!"
          />
        ),
        selectorId: DASHBOARD_TOUR_STEP_IDS.SUPPORT + (isMobile ? "-mob" : ""),
        position: isMobile ? "bottom" : "right", // Change to bottom on mobile
        onClickWithinArea: () => {},
      },
    ],
    [isMobile]
  );

  // Remove onboarding parameter from URL
  const removeOnboardingParam = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("onboarding");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Handle tour completion
  const handleTourComplete = useCallback(() => {
    localStorage.setItem("dashboard-tour-completed", "true");
    setIsTourCompletedInStorage(true);
    removeOnboardingParam();
  }, [removeOnboardingParam]);

  // Handle tour skip
  const handleTourSkip = useCallback(() => {
    localStorage.setItem("dashboard-tour-completed", "true");
    setIsTourCompletedInStorage(true);
    removeOnboardingParam();
  }, [removeOnboardingParam]);

  useEffect(() => {
    setSteps(steps);
    // Only show tour if not completed in localStorage
    if (!isTourCompletedInStorage) {
      const timer = setTimeout(() => {
        setOpenTour(true);
        setHasShownTour(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [setSteps, steps, isTourCompletedInStorage]);

  // Handle when tour dialog is closed (either by skip or start)
  useEffect(() => {
    if (!openTour && hasShownTour && !isTourCompletedInStorage) {
      // This means the dialog was closed after being shown, so we should handle the skip case
      const timer = setTimeout(() => {
        handleTourSkip();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openTour, hasShownTour, isTourCompletedInStorage, handleTourSkip]);

  // Don't render tour if it's been completed
  if (isTourCompletedInStorage) {
    return null;
  }

  return (
    <TourAlertDialog isOpen={openTour} setIsOpen={setOpenTour} onComplete={handleTourComplete} />
  );
}
