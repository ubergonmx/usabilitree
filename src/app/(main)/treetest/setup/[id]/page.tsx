import { getCurrentUser } from "@/lib/auth/session";
import { Paths } from "@/lib/constants";
import { notFound, redirect } from "next/navigation";
import SetupTabs from "./_components/setup-tabs";
import { db } from "@/db";
import { studies } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SetupPageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SetupPage({ params, searchParams }: SetupPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(Paths.Login);
  }

  const [study] = await db.select().from(studies).where(eq(studies.id, params.id));

  if (!study || study.userId !== user.id) {
    notFound();
  }

  const showTour = searchParams.onboarding === "1";

  return <SetupTabs params={params} showTour={showTour} />;
}
