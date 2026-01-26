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
  showWidget: (options?: UserJotWidgetOptions) => void;
  identify: (user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => void;
}

declare global {
  interface Window {
    uj?: UserJot;
    $ujq?: unknown[];
  }
}

export {};
