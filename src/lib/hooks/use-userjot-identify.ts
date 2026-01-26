// "use client";

// import { useEffect } from "react";
// import type { User } from "@/db/schema";

// export function useUserJotIdentify(user: User | null | undefined) {
//   useEffect(() => {
//     if (typeof window === "undefined" || !window.uj) return;

//     if (user) {
//       // Identify the user with UserJot
//       window.uj.identify({
//         id: user.email, // Email instead of id because of future overhaul
//         email: user.email,
//         avatar: user.avatar || undefined,
//       });
//     } else {
//       // Clear identification when user logs out
//       window.uj.identify(null);
//     }
//   }, [user]);
// }
