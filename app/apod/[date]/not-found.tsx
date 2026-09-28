import { StatusMessage } from "@/components/ui/StatusMessage";
import { TextLink } from "@/components/ui/TextLink";

export default function ApodNotFound() {
  return (
    <StatusMessage title="Picture not found" action={<TextLink href="/">Back to all pictures</TextLink>}>
      There&apos;s no picture for that date. The date may be invalid or outside the past year, or
      today&apos;s picture may not be published yet.
    </StatusMessage>
  );
}
