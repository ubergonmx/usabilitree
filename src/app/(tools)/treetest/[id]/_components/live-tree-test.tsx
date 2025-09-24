"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";
import { loadTestPageData } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";
import * as Sentry from "@sentry/react";
import { toast } from "sonner";

const INSTRUCTION_DELAY_MS = 5000;

const TestLivePage = ({ params }: { params: { id: string } }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [customText, setCustomText] = useState<{
    instructions: string;
    startTest: string;
    nextButton: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canStart, setCanStart] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadTestPageData(params.id)
      .then((data) => {
        setWelcomeMessage(data.welcomeMessage);
        setIsCompleted(data.isCompleted);
        setCustomText(data.customText);
        setCompletedMessage(data.completedMessage);
      })
      .catch((error) => {
        setError("Failed to load study data");
        Sentry.captureException(error);
      });
  }, [params.id]);

  useEffect(() => {
    if (showInstructions) {
      setCanStart(false);
      setProgress(0);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min(100, (elapsed / INSTRUCTION_DELAY_MS) * 100);

        setProgress(progressPercent);

        if (elapsed >= INSTRUCTION_DELAY_MS) {
          setCanStart(true);
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [showInstructions]);

  const handleNextClick = useCallback(() => {
    try {
      if (showInstructions) {
        router.push(`/treetest/${params.id}/tasks`);
      } else {
        setShowInstructions(true);
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error("An error occurred. Please reload the page and try again.");
    }
  }, [showInstructions, router, params.id]);

  if (isCompleted) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="p-6">
          {completedMessage === null ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <MarkdownPreview content={completedMessage} />
          )}
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="h-1 bg-theme"></div>
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-1 bg-theme"></div>
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="p-6">
          {!showInstructions ? (
            <div className="space-y-6">
              {welcomeMessage === null ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <MarkdownPreview content={welcomeMessage} />
              )}
              <div className="flex justify-end">
                <Button onClick={handleNextClick} disabled={welcomeMessage === null}>
                  {customText?.nextButton || "Next"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {customText === null ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <MarkdownPreview content={customText.instructions} />
              )}
              <div className="flex justify-end">
                <Button onClick={handleNextClick} disabled={!canStart || !customText}>
                  {!canStart && (
                    <svg className="mr-1 h-4 w-4" viewBox="0 0 36 36" aria-hidden="true">
                      <path
                        className="stroke-current/20"
                        fill="none"
                        strokeWidth="5"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-current transition-all duration-75 ease-out"
                        fill="none"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  )}
                  {customText?.startTest || "Start Test"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default TestLivePage;
