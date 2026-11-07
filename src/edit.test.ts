import { parseCamel, toCamelCode } from "./camel-parser";
import { canPlaceCamel, moveCamelTo } from "./edit";

const move = (code: string, color: Parameters<typeof moveCamelTo>[1], space: number, index: number) => {
  const result = moveCamelTo(parseCamel(code), color, space, index);
  return result ? toCamelCode(result) : undefined;
};

test("moves a single camel to another space", () => {
  expect(move("rgu,,y", "Green", 3, 0)).toBe("ru,,y,g");
  // onto the top of a stack
  expect(move("rgu,,y", "Red", 2, 1)).toBe("gu,,yr");
  // under a stack
  expect(move("rgu,,y", "Yellow", 0, 0)).toBe("yrgu");
});

test("reorders a stack on the same space", () => {
  expect(move("rgu", "Red", 0, 2)).toBe("gur");
  expect(move("rgu", "Blue", 0, 0)).toBe("urg");
  expect(move("rgu", "Green", 0, 1)).toBe("rgu");
});

test("crazy camels and empty spaces at the end", () => {
  expect(move("r,13,w,b", "Black", 2, 0)).toBe("r,,b,11,w");
  expect(move("r", "Red", 15, 0)).toBe(",14,r");
});

test("camels can't go on tiles, off the track or be invented", () => {
  expect(move("r,o,g", "Red", 1, 0)).toBeUndefined();
  expect(move("r,d,g", "Red", 1, 0)).toBeUndefined();
  expect(move("r", "Red", 16, 0)).toBeUndefined();
  expect(move("r", "Red", -1, 0)).toBeUndefined();
  expect(move("r", "Green", 2, 0)).toBeUndefined();
  expect(canPlaceCamel(parseCamel("r,,o"), 1)).toBe(true);
  expect(canPlaceCamel(parseCamel("r,,o"), 2)).toBe(false);
});

test("finished camels can be dragged back onto the track", () => {
  // green has crossed the finish line (space index 16)
  expect(move("r,15,g", "Green", 5, 0)).toBe("r,4,g");
});
