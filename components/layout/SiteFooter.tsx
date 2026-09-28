import { TextLink } from "@/components/ui/TextLink";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-neutral-400 sm:px-6">
        Images and text courtesy of NASA&apos;s{" "}
        <TextLink href="https://science.nasa.gov/apod/">Astronomy Picture of the Day</TextLink>.
      </p>
    </footer>
  );
}
