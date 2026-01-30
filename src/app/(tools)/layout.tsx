import PageTheme from "@/providers/page-theme";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const ToolLayout = ({ children }: { children: ReactNode }) => {
  return <PageTheme>{children}</PageTheme>;
};

export default ToolLayout;
