import { getImageProps } from "next/image";
import { ViewTransition, type ComponentProps } from "react";
import type { Apod } from "@/lib/apod/types";
import { ImageLightbox } from "./ImageLightbox";

/** Tallest the media may get, so it always fits on screen with the title. */
const MAX_HEIGHT = "75vh";

const FRAME_BASE = "relative overflow-hidden rounded-xl border border-border bg-black";

type FrameProps = Pick<ComponentProps<"div">, "className" | "style">;

/**
 * Sizes the frame around the media, in order of preference:
 * 1. Known size: the frame takes the image's aspect ratio, so it scales with
 *    the screen and the picture fills it edge to edge with no layout shift.
 *    Width is capped at MAX_HEIGHT × ratio, so tall portraits shrink to fit
 *    the viewport instead of overflowing it.
 * 2. Unknown size, image: the frame shrink-wraps the image, which the browser
 *    sizes from the loaded file (one small shift on load is unavoidable).
 * 3. Unknown size, video or no media: a 16:9 frame, letterboxed.
 */
function frameProps(apod: Apod, showsImage: boolean): FrameProps {
  const { imageWidth, imageHeight } = apod;
  if (imageWidth && imageHeight) {
    const ratio = imageWidth / imageHeight;
    return {
      className: `${FRAME_BASE} mx-auto`,
      style: { aspectRatio: ratio, width: `min(100%, calc(${MAX_HEIGHT} * ${ratio}))` },
    };
  }
  if (showsImage) return { className: `${FRAME_BASE} mx-auto w-fit max-w-full` };
  return { className: `${FRAME_BASE} aspect-video w-full` };
}

/**
 * Renders the APOD's image or video. Images go through `next/image`, so the
 * browser downloads a resized rendition, not the multi-megapixel original.
 *
 * The frame shares a view-transition name with the matching card on the home
 * page, so the thumbnail visually morphs into this frame on navigation.
 */
export function ApodMedia({ apod }: { apod: Apod }) {
  const { imageUrl, alt, title } = apod;
  const altText = alt || title;
  const videoUrl = apod.mediaType === "video" ? apod.videoUrl : null;
  const hasKnownSize = apod.imageWidth !== null && apod.imageHeight !== null;

  return (
    <ViewTransition name={`apod-${apod.date}`} share="morph" default="none">
      <div {...frameProps(apod, !videoUrl && imageUrl !== null)}>
        {videoUrl ? (
          <video
            controls
            preload="none"
            poster={imageUrl ? posterUrl(imageUrl) : undefined}
            aria-label={altText}
            className="h-full w-full object-contain"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        ) : imageUrl ? (
          <ImageLightbox src={imageUrl} alt={altText} sizing={hasKnownSize ? "fill" : "intrinsic"} />
        ) : (
          <p className="grid h-full place-items-center text-neutral-300">
            No image is available for this entry.
          </p>
        )}
      </div>
    </ViewTransition>
  );
}

/**
 * The poster goes through the image optimizer too, which also keeps it
 * same-origin for the Content Security Policy.
 */
function posterUrl(imageUrl: string): string {
  return getImageProps({ src: imageUrl, alt: "", width: 960, height: 540 }).props.src;
}
