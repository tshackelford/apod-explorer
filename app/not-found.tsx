import { StatusMessage } from "@/components/ui/StatusMessage";
import { TextLink } from "@/components/ui/TextLink";

/** Site-wide 404 for any URL that doesn't match a route. */
export default function NotFound() {
  return (
    <StatusMessage title="Page not found" action={<TextLink href="/">Back to all pictures</TextLink>}>
      We couldn&apos;t find the page you were looking for.
    </StatusMessage>
  );
}
