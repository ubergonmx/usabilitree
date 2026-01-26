// UserJot types
interface UserJotConfig {
  widget?: boolean;
  position?: "left" | "right";
  theme?: "auto" | "light" | "dark";
  trigger?: "default" | "custom";
}

interface UserJotWidgetOptions {
  section?: "roadmap" | "feedback";
}

interface UserJot {
  init: (projectId: string, config?: UserJotConfig) => void;
  showWidget: (options?: { section?: "roadmap" | "feedback" | "updates" }) => void;
  hideWidget: () => void;
  // Allow null for logging out users
  identify: (
    user: {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    } | null
  ) => void;
}

declare global {
  interface Window {
    uj?: UserJot;
    $ujq?: unknown[];
  }
}

export {};
