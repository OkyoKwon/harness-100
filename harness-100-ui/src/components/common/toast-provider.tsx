"use client";

import { ToastContext, useToastState } from "@/hooks/use-toast";
import { Toast } from "@/components/common/toast";

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const state = useToastState();

  return (
    <ToastContext.Provider value={state}>
      {children}
      {/* Toast container */}
      {state.toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
          {state.toasts.map((toast) => (
            <Toast
              key={toast.id}
              item={toast}
              onDismiss={() => state.removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
