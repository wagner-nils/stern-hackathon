// Fingerprint of the model, state and data the tool computes with (tests excluded). Capture records the fingerprint
// of the commit each screenshot was built from; the build refuses to combine those screenshots with re-runs of a
// different working tree.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIRS = ["model", "state", "data"];

/** Fingerprint of the working tree. */
export function modelFingerprint(repo) {
  const h = createHash("sha256");
  for (const dir of DIRS) {
    const base = join(repo, "dashboard/src", dir);
    for (const f of readdirSync(base).filter((f) => !f.includes(".test.")).sort()) h.update(`${dir}/${f}\n`).update(readFileSync(join(base, f)));
  }
  return h.digest("hex").slice(0, 16);
}

/** The same fingerprint, read from a commit instead of the working tree. */
export function modelFingerprintAt(repo, commit) {
  const git = (...a) => execFileSync("git", a, { cwd: repo, maxBuffer: 64 * 1024 * 1024 });
  const h = createHash("sha256");
  for (const dir of DIRS) {
    const names = git("ls-tree", "--name-only", `${commit}:dashboard/src/${dir}`).toString().split("\n").filter((f) => f && !f.includes(".test.")).sort();
    for (const f of names) h.update(`${dir}/${f}\n`).update(git("show", `${commit}:dashboard/src/${dir}/${f}`));
  }
  return h.digest("hex").slice(0, 16);
}
