// node --test journey/build/audit.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { keys, tokens } from "./audit.mjs";

const tool = keys("€152 M revenue 2030 · −€35 M operating profit · 242 sources · 9.3% · €11.1 bn · 4,521 satellites · €90 M");

test("sign, unit and magnitude are part of a figure", () => {
  assert.equal(tokens("−€35 M")[0].key, "-35€M");
  assert.equal(tokens("9.3 %")[0].key, "9.3%");
  assert.equal(tokens("€11.1 bn")[0].key, "11.1€bn");
  assert.equal(tokens("4,521")[0].key, "4521");
});

test("false claims do not match the tool's figures", () => {
  assert.ok(!tool.has(tokens("−€242 M")[0].key), "a count is not a revenue");
  assert.ok(!tool.has(tokens("€152 billion")[0].key), "billion is not M");
  assert.ok(!tool.has(tokens("€35 M")[0].key), "a loss is not a profit");
  assert.ok(!tool.has(tokens("52")[0].key), "52 does not match inside 152");
});

test("true claims match, ranges and trailing zeros included", () => {
  assert.ok(tool.has(tokens("€152 M")[0].key));
  assert.ok(tool.has(tokens("9.30 %")[0].key));
  const r = tokens("€40–90 M").map((t) => t.key);
  assert.deepEqual(r, ["40€M", "90€M"]);
});
