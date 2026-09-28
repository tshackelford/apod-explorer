"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";

/** Rendered width of the detail frame: the full content column. */
const DETAIL_SIZES = "(min-width: 1152px) 1104px, 100vw";

type ImageLightboxProps = {
  src: string;
  alt: string;
  /**
   * fill: the parent frame already has the image's aspect ratio; fill it.
   * intrinsic: size unknown; let the loaded image size itself (and the frame).
   */
  sizing: "fill" | "intrinsic";
};

/**
 * The detail image, clickable to view it full screen.
 *
 * Built on the native <dialog> element: `showModal()` gives us focus
 * trapping, Escape to close, a backdrop, top-layer stacking, and focus
 * returning to the trigger on close. No library or custom focus management.
 * The full-size image is only mounted while the dialog is open, so it is
 * downloaded only if the user asks for it.
 */
export function ImageLightbox({ src, alt, sizing }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  // A click on the dialog element itself (not its contents) is a backdrop click.
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={`group cursor-zoom-in ${sizing === "fill" ? "absolute inset-0 h-full w-full" : "relative block"}`}
      >
        {sizing === "fill" ? (
          <Image src={src} alt={alt} fill loading="eager" sizes={DETAIL_SIZES} className="object-contain" />
        ) : (
          // width/height only set the placeholder shape until the file loads;
          // `h-auto w-auto` then lets the image's real proportions take over.
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1200}
            loading="eager"
            sizes={DETAIL_SIZES}
            className="block h-auto max-h-[calc(75vh-2px)] w-auto max-w-full"
          />
        )}
        <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          View full image
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Full image"
        onClose={() => setIsOpen(false)}
        onClick={handleDialogClick}
        className="m-auto h-dvh max-h-none w-dvw max-w-none bg-transparent p-4 backdrop:bg-black/90 sm:p-6"
      >
        {isOpen && (
          <div className="flex h-full flex-col gap-3">
            <div className="flex justify-end gap-3">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Open original
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <Button size="sm" onClick={close} autoFocus>
                Close
              </Button>
            </div>
            <div className="relative flex-1">
              <Image src={src} alt={alt} fill sizes="95vw" className="object-contain" />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
