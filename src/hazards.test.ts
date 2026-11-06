import { parseCamel, toCamelCode } from "./camel-parser";
import { toggleHazard } from "./hazards";

const toggle = (code: string, index: number) => {
  const result = toggleHazard(parseCamel(code), index);
  return "error" in result ? result.error : toCamelCode(result.state);
};

test("cycles oasis, desert, then nothing", () => {
  expect(toggle("r,,g", 1)).toBe("r,o,g");
  expect(toggle("r,o,g", 1)).toBe("r,d,g");
  expect(toggle("r,d,g", 1)).toBe("r,,g");
  expect(toggle("r", 5)).toBe("r,4,o");
});

test("tiles follow the placement rules", () => {
  expect(toggle(",r,g", 0)).toMatch(/first space/);
  expect(toggle("r,g", 1)).toMatch(/has camels/);
  expect(toggle("r,,o,,g", 1)).toMatch(/next to another tile/);
  expect(toggle("r,,o,,g", 4)).toMatch(/has camels/);
  expect(toggle("r,,,o,,g", 1)).toBe("r,o,,o,,g");
});
