import { describe, expect, it } from "vitest";
import { htmlToText } from "./html";

describe("htmlToText", () => {
  it("strips tags and keeps link text", () => {
    expect(htmlToText('<strong>Explanation:</strong> See <a href="https://x.test">M83</a>.')).toBe(
      "Explanation: See M83.",
    );
  });

  it("decodes named and numeric entities", () => {
    expect(htmlToText("Rock&nbsp;&amp;&nbsp;roll &#8212; &#x2019;")).toBe("Rock & roll — ’");
  });

  it("returns markup-looking text as inert text, not tags", () => {
    // Escaped input decodes to literal characters, which React then escapes on render.
    expect(htmlToText("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe("<script>alert(1)</script>");
    expect(htmlToText("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("collapses whitespace and non-breaking spaces", () => {
    expect(htmlToText("a \n\n  b<br/>c")).toBe("a b c");
  });

  it("leaves unknown entities untouched", () => {
    expect(htmlToText("&bogus; &#0;")).toBe("&bogus; &#0;");
  });
});
