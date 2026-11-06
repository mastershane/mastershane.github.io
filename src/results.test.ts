import { getBgColor } from "./results";

const channels = (color: string) => color.match(/\d+/g)!.map(Number);

test("values go from red through yellow to green", () => {
  expect(getBgColor(-1)).toBe("rgb(255, 0, 0)");
  expect(getBgColor(0)).toBe("rgb(255, 255, 0)");
  expect(getBgColor(1)).toBe("rgb(170, 255, 0)");
  expect(getBgColor(3)).toBe("rgb(0, 255, 0)");
});

test("values just below 1 are slightly green, not red", () => {
  // these used to come out as pure red
  [0.99, 0.997, 0.9995].forEach((v) => {
    const [red, green] = channels(getBgColor(v));
    expect(green).toBe(255);
    expect(red).toBeLessThan(175);
  });
});

test("the color changes smoothly as the value goes up", () => {
  let previous = channels(getBgColor(-1.5));
  for (let v = -1.5; v <= 4; v += 0.001) {
    const current = channels(getBgColor(v));
    // red only goes down, green only goes up, by at most one step at a time
    expect(current[0]).toBeLessThanOrEqual(previous[0]);
    expect(current[1]).toBeGreaterThanOrEqual(previous[1]);
    expect(previous[0] - current[0]).toBeLessThanOrEqual(1);
    expect(current[1] - previous[1]).toBeLessThanOrEqual(1);
    previous = current;
  }
});
