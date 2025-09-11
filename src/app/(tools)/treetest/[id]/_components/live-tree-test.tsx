"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card } from "@/components/ui/card";
import { loadWelcomeMessage, checkStudyCompletion } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";
import * as Sentry from "@sentry/react";

const instructions = `# Instructions
**Here's how it works:**

1. You will be presented with an organized list of links (like a menu on a website) and an item to find within (like an article or a piece of information).
2. Click through the list until you arrive at one that you think helps you complete the task.
3. If you take a wrong turn, you can always go back by clicking any of the links above.

![](https://***REMOVED***)

_This is not a test of your ability, there are no right or wrong answers._  
  
**That's it, let's get started!**`;

const completedMessage = `# Thank You!

This study has been completed. We have collected all the responses we need.

Thank you for your interest in participating.`;

const INSTRUCTION_DELAY_MS = 5000;

const TestLivePage = ({ params }: { params: { id: string } }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canStart, setCanStart] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    Promise.all([loadWelcomeMessage(params.id), checkStudyCompletion(params.id)])
      .then(([message, completed]) => {
        setWelcomeMessage(message);
        setIsCompleted(completed);
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

  const handleNextClick = () => {
    if (showInstructions) {
      router.push(`/treetest/${params.id}/tasks`);
    } else {
      setShowInstructions(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="p-6">
          <MarkdownPreview content={completedMessage} />
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
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <MarkdownPreview content={instructions} />
              <div className="flex justify-end">
                <Button onClick={handleNextClick} disabled={!canStart}>
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
                  Start Test
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
