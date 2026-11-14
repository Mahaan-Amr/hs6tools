import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseForESLint } from "@typescript-eslint/parser";

test("TypeScript project service accepts a matching default-project file", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "hs6-lint-compat-"));
  try {
    await writeFile(path.join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { allowJs: true }, include: ["src/**/*.ts"] }));
    const filename = path.join(dir, "sample.js");
    await writeFile(filename, "const value = 1;\n");
    const result = parseForESLint("const value = 1;\n", {
      filePath: filename,
      tsconfigRootDir: dir,
      projectService: { allowDefaultProject: ["*.js"] },
    });
    assert.equal(result.ast.body[0].type, "VariableDeclaration");
    assert.ok(result.services.program);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
