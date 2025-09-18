"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [openTour, setOpenTour] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)"); // Tailwind's md breakpoint
  const { setSteps } = useTour();

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

  useEffect(() => {
    setSteps(steps);
    const timer = setTimeout(() => {
      setOpenTour(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [setSteps, steps]);
  return <TourAlertDialog isOpen={openTour} setIsOpen={setOpenTour} />;
}
