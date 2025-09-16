"use client";

import { Pencil2Icon, LinkIcon, BarChartIcon, UsersIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Studies } from "@/db/schema";
import { DASHBOARD_TOUR_STEP_IDS } from "@/lib/constants";
import Link from "next/link";
import * as React from "react";

interface StudyCardProps {
  study: Studies;
  userName?: string;
  isOwner: boolean;
}

export const StudyCard = ({ study, userName, isOwner }: StudyCardProps) => {
  const getMainActionUrl = () => {
    if (study.status === "draft") {
      return `/treetest/setup/${study.id}`;
    }
    if (isSampleStudy) return `/treetest/results/${study.id}?onboarding=1`;
    return `/treetest/results/${study.id}`;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/treetest/${study.id}`, "_blank");
  };

  const isSampleStudy =
    study.title === "Sample tree test" &&
    study.description === "Government website example" &&
    study.status === "active" &&
    isOwner;

  return (
    <Link
      href={getMainActionUrl()}
      className="block h-full"
      id={isSampleStudy ? DASHBOARD_TOUR_STEP_IDS.SAMPLE_STUDY : undefined}
    >
      <Card className="flex h-full cursor-pointer flex-col transition-all duration-200 hover:-translate-y-1 hover:bg-accent/20 hover:shadow-lg">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="line-clamp-2 flex items-center gap-2">
              {study.title}
              {!isOwner && <UsersIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            {study.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                className="z-10 h-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleLinkClick}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription className="flex flex-col space-y-1 text-sm">
            {userName && <span>Shared by {userName}</span>}
            <span>
              {new Date(Number(study.createdAt) / 1000).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="line-clamp-3 text-sm text-muted-foreground">{study.description}</p>
        </CardContent>
        <CardFooter className="mt-auto flex-shrink-0 flex-row-reverse gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {study.status === "draft" ? (
              <>
                <Pencil2Icon className="h-4 w-4" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <BarChartIcon className="h-4 w-4" />
                <span>Results</span>
              </>
            )}
          </div>
          <Badge
            variant="outline"
            className={`mr-auto rounded-lg capitalize ${
              study.status === "active" ? "bg-green-50 text-green-700" : ""
            }`}
          >
            {study.status}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};
