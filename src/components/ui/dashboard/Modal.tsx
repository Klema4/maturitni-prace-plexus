"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { cva, type VariantProps } from "cva";

const modalVariants = cva({
  base: "w-full transition-all duration-200 ease-out",
  variants: {
    size: {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-xl",
      xl: "max-w-2xl",
      "2xl": "max-w-3xl",
      full: "max-w-[95vw] h-[95vh]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Hlavní komponenta Modal
 */
export function Modal({
  isOpen,
  onClose,
  children,
  className,
  size,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Zavřít modal"
      className={clsx(
        "fixed inset-0 bg-black/25 flex items-center justify-center z-9999 backdrop-blur-xs transition-opacity duration-200 p-4",
        isAnimated ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className={clsx(
          modalVariants({ size }),
          className,
          isAnimated
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2",
        )}
      >
        <div className="w-full max-h-[90vh] overflow-hidden flex flex-col border border-zinc-800/50 bg-zinc-900 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Hlavička modalu s integrovaným křížkem vpravo
 */
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function ModalHeader({
  children,
  className,
  onClose,
}: ModalHeaderProps) {
  return (
    <div
      className={clsx(
        "p-4! border-b border-zinc-800/50 flex items-center justify-between gap-4",
        className,
      )}
    >
      <div className="font-semibold tracking-tight text-lg text-white">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="cursor-pointer size-8 flex items-center justify-center text-zinc-300 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all"
          aria-label="Zavřít"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

/**
 * Tělo modalu (hlavní obsah)
 */
export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "p-4! overflow-y-auto flex-1 text-sm text-zinc-400",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Patička modalu
 */
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "p-4! border-t border-zinc-800/50 flex items-center justify-end gap-2 bg-zinc-900/50",
        className,
      )}
    >
      {children}
    </div>
  );
}
