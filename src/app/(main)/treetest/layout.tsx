import { TourProvider } from "@/components/tour";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return <TourProvider>{children}</TourProvider>;
}
