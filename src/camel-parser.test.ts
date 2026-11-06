import { parseCamel, parseDice, toCamelCode } from "./camel-parser";
import { RULES } from "./rules";

test("version 2 camel code", () => {
  const state = parseCamel("rw,o,pb");
  expect(state.tiles.map((t) => t.camels)).toEqual([["Red", "White"], [], ["Purple", "Black"]]);
  expect(parseDice("rguypc").map((d) => d.color)).toEqual(["Red", "Green", "Blue", "Yellow", "Purple", "Gray"]);
});

test("version 1 camel code uses w for the white racing camel", () => {
  const state = parseCamel("rw,d,g", RULES.v1);
  // the white racing camel uses the fifth racing camel slot
  expect(state.tiles[0].camels).toEqual(["Red", "Purple"]);
  expect(toCamelCode(state, RULES.v1)).toBe("rw,d,g");
  expect(parseDice("rguyw", RULES.v1).map((d) => d.color)).toEqual(["Red", "Green", "Blue", "Yellow", "Purple"]);
  // there are no purple or crazy camels in version 1
  expect(() => parseCamel("p", RULES.v1)).toThrow();
  expect(() => parseCamel("b", RULES.v1)).toThrow();
});
