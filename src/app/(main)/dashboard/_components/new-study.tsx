"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { createStudy } from "@/lib/treetest/actions";
import { createSampleTreeTestStudy } from "@/lib/treetest/sample-actions";
import * as Sentry from "@sentry/react";

interface NewPostProps {
  isEligible: boolean;
}

export const NewStudy = ({ isEligible }: NewPostProps) => {
  const router = useRouter();
  const [isCreatePending, startCreateTransaction] = React.useTransition();
  const [showDialog, setShowDialog] = React.useState(false);

  const createPost = (type: "tree_test" | "card_sort" | "sample_tree_test") => {
    if (!isEligible) {
      toast.message("You've reached the limit of posts for your current plan", {
        description: "Upgrade to create more posts",
      });
      return;
    }

    startCreateTransaction(async () => {
      try {
        let result;
        if (type === "sample_tree_test") {
          result = await createSampleTreeTestStudy();
          toast.success("Sample study created successfully. Please wait for setup to load.");
        } else {
          result = await createStudy(type);
          toast.success("Study created successfully");
        }

        // Navigate to the setup page for tree tests
        if (type === "tree_test" || type === "sample_tree_test") {
          router.push(`/treetest/setup/${result.id}`);
        } else {
          // For future card sort implementation
          router.push("/dashboard");
        }
      } catch (error) {
        toast.error("Failed to create study");
        Sentry.captureException(error);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="flex h-full cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
        disabled={isCreatePending}
      >
        <div className="flex flex-col items-center gap-4">
          <FilePlusIcon className="h-10 w-10" />
          <p className="text-sm">New Study</p>
        </div>
      </Button>

      <StudyTypeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSelect={(type) => {
          setShowDialog(false);
          createPost(type);
        }}
      />
    </>
  );
};

interface StudyTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: "tree_test" | "card_sort" | "sample_tree_test") => void;
}

function StudyTypeDialog({ open, onOpenChange, onSelect }: StudyTypeDialogProps) {
  const [selectedType, setSelectedType] = React.useState<
    "tree_test" | "card_sort" | "sample_tree_test"
  >("tree_test");

  const studyTypes = [
    {
      id: "tree_test",
      title: "Tree Test",
      description: "Evaluate the information architecture and findability of your website or app",
      available: true,
    },
    {
      id: "card_sort",
      title: "Card Sort",
      description: "Understand how users categorize and organize information",
      available: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Study Type</DialogTitle>
          <DialogDescription>Select the type of study you want to create.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {studyTypes.map((study) => (
            <Card
              key={study.id}
              className={`cursor-pointer transition-all duration-150 ease-out ${
                selectedType === study.id
                  ? "border-primary/60 bg-primary/5"
                  : study.available
                    ? "border-black/10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-black/20"
                    : "cursor-not-allowed border-black/5 bg-gray-50/50 opacity-60"
              }`}
              onClick={() =>
                study.available && setSelectedType(study.id as "tree_test" | "card_sort")
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium">{study.title}</h3>
                      {!study.available && (
                        <Badge variant="secondary" className="text-xs">
                          Not Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{study.description}</p>
                  </div>
                  {selectedType === study.id && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onSelect(selectedType)}>Create Study</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
