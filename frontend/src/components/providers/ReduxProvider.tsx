"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store/store";
import { Toaster } from "sonner";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#111816",
            border: "1px solid rgba(57, 255, 20, 0.25)",
            color: "#F5F7F5",
            fontFamily: "var(--font-geist-mono), monospace",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.8)",
          },
        }}
      />
    </Provider>
  );
}
