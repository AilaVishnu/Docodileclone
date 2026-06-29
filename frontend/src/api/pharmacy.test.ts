import { parseInventoryCsv } from "./pharmacy";

// Regression: a facewash/cleanser CSV row used to fall through inferForm()'s
// keyword list to the "tablet" default (only inferCategory knew the WASH/CLEANS
// keyword), so a facewash showed up tagged "tablet". inferForm now maps the
// cleanser family to the "soap" form, matching inferCategory.
describe("parseInventoryCsv form inference", () => {
  const row = (name: string) =>
    parseInventoryCsv(`${name},SL00642,C0740004,270,399,1,399,2,Apr-2026,5,18`).rows[0];

  it("infers the soap form (not tablet) for a facewash, with the cleanser category", () => {
    const med = row("AV CLIN FACEWASH");
    expect(med.form).toBe("soap");
    expect(med.category).toBe("Cleansers & soaps");
  });

  it("infers soap for other cleanser names (FACE WASH, CLEANSER, SOAP)", () => {
    expect(row("GENTLE FACE WASH").form).toBe("soap");
    expect(row("FOAMING CLEANSER").form).toBe("soap");
    expect(row("NEEM SOAP").form).toBe("soap");
  });

  it("still infers tablet and other forms correctly", () => {
    expect(row("PARACETAMOL 500 TABLET").form).toBe("tablet");
    expect(row("VITAMIN C SERUM").form).toBe("serum");
    expect(row("MOISTURISING CREAM").form).toBe("cream");
  });
});
