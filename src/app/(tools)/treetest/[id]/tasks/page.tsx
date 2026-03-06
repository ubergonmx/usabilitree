"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useIdleTimer } from "react-idle-timer";
import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";
import { TreeTestConfig } from "@/lib/types/tree-test";
import { shuffle } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/tree-test-loading-skeleton";

export default function TreeTestPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<TreeTestConfig>();
  const [initialTaskIndex, setInitialTaskIndex] = useState(0);
  const [savedActiveTime, setSavedActiveTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  // Use a ref to prevent duplicate fetches in development strict mode
  const configFetchedRef = useRef(false);

  // Start the idle timer
  const { getTotalActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 3, // 3 minutes
    startOnMount: true,
    onIdle: () => {
      console.log("User is idle");
      storeActiveTime();
    },
    onAction: () => {
      // Periodically store active time
      if (Math.random() < 0.1) {
        storeActiveTime();
      }
    },
    debounce: 500,
  });

  // Store task index in localStorage - defined with useCallback to memoize
  const storeTaskIndex = useCallback(
    (taskIndex: number) => {
      try {
        const key = `treeTest_${params.id}_currentTask`;
        localStorage.setItem(key, taskIndex.toString());
      } catch (error) {
        console.error("Error storing task index in localStorage:", error);
      }
    },
    [params.id]
  );

  // Store active time in localStorage - defined with useCallback to memoize
  const storeActiveTime = useCallback(() => {
    try {
      const key = `treeTest_${params.id}_activeTime`;
      const totalActiveTime = getTotalActiveTime() + savedActiveTime;
      localStorage.setItem(key, totalActiveTime.toString());
    } catch (error) {
      console.error("Error storing active time in localStorage:", error);
    }
  }, [getTotalActiveTime, params.id, savedActiveTime]);

  useEffect(() => {
    // Skip if already fetched to prevent double fetching in development
    if (configFetchedRef.current) return;

    const fetchConfig = async () => {
      configFetchedRef.current = true; // Mark as fetched immediately
      const participantId = localStorage.getItem("participantId");
      const orderKey = `treeTest_${params.id}_taskOrder`;
      const currentTaskKey = `treeTest_${params.id}_currentTask`;
      let config: TreeTestConfig;

      if (participantId) {
        config = await loadTestConfig(params.id, false, participantId);
        if (config.participantId === participantId) {
          // Retrieve the stored task index and active time from localStorage
          const activeTimeKey = `treeTest_${params.id}_activeTime`;
          const storedActiveTime = localStorage.getItem(activeTimeKey);
          const storedCurrentTask = localStorage.getItem(currentTaskKey);
          if (storedActiveTime) {
            const parsedActiveTime = parseInt(storedActiveTime, 10);
            // Check if the stored active time is valid
            if (parsedActiveTime >= 0) {
              setSavedActiveTime(parsedActiveTime);
            }
          }
          if (storedCurrentTask) {
            const parsedCurrentTask = parseInt(storedCurrentTask, 10);
            // Check if the stored task index is valid
            if (parsedCurrentTask >= 0 && config.tasks) {
              if (parsedCurrentTask < config.tasks.length) {
                // Set before order restoration — if restoration succeeds, this value
                // is correct (index maps to stored order). If it fails, the restoration
                // block calls setInitialTaskIndex(0) which overwrites this (React batching).
                setInitialTaskIndex(parsedCurrentTask);
              } else {
                // If the stored task index is out of bounds, reset to 0
                setInitialTaskIndex(0);
                storeTaskIndex(0); // Reset task index in localStorage
              }
            }
          }
        } else {
          // If the participantId doesn't match, set the new one
          localStorage.setItem("participantId", config.participantId!);
          storeTaskIndex(0); // Reset task index
        }
      } else {
        config = await loadTestConfig(params.id);
        localStorage.setItem("participantId", config.participantId!);
      }
      const storedOrder = localStorage.getItem(orderKey);
      // Read before any modifications — used to detect in-progress participants
      const priorTaskIndex = localStorage.getItem(currentTaskKey);
      let hasProgress = priorTaskIndex !== null;
      let restored = false;

      if (storedOrder) {
        try {
          const order: string[] = JSON.parse(storedOrder);
          const reordered = order
            .map((id) => config.tasks.find((t) => t.id === id))
            .filter(Boolean) as typeof config.tasks;
          if (reordered.length === config.tasks.length) {
            // Restore stored order regardless of whether randomizeTasks is still on
            config = { ...config, tasks: reordered };
            restored = true;
          } else {
            // Task count changed — clear stale order and reset progress
            localStorage.removeItem(orderKey);
            localStorage.removeItem(currentTaskKey);
            setInitialTaskIndex(0);
            hasProgress = false;
          }
        } catch {
          // Corrupted value — clear and reset progress
          localStorage.removeItem(orderKey);
          localStorage.removeItem(currentTaskKey);
          setInitialTaskIndex(0);
          hasProgress = false;
        }
      }

      if (!restored && config.randomizeTasks && !hasProgress) {
        // Only shuffle for fresh starts — don't reshuffle mid-study if owner
        // enabled randomization after the participant already began
        const shuffled = shuffle(config.tasks);
        localStorage.setItem(orderKey, JSON.stringify(shuffled.map((t) => t.id)));
        config = { ...config, tasks: shuffled };
      }

      setConfig(config);
      setIsInitialized(true);
    };

    fetchConfig();
  }, [params.id, storeTaskIndex]);

  useEffect(() => {
    // Your existing beforeunload handler
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      storeActiveTime();
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // Add visibility change handler as backup
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        storeActiveTime();
      }
    };

    if (config && config.tree.length > 0 && config.tasks.length > 0) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [config, storeActiveTime]);

  if (!config || !isInitialized) {
    return <LoadingSkeleton />;
  }

  return (
    <TreeTestComponent
      config={config}
      initialTaskIndex={initialTaskIndex}
      onTaskChange={(taskIndex) => {
        storeTaskIndex(taskIndex);
        storeActiveTime();
      }}
    />
  );
}
