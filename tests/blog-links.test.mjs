import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { checkBlogLinks } from "../scripts/check-blog-links.mjs";

test("checked-in blog pages have resolvable local links and images", async () => {
  const result = await checkBlogLinks({ rootDir: process.cwd() });
  assert.equal(result.pages, 46);
  assert.ok(result.checked > 100);
});

test("blog link checker reports a missing internal target", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "hizakozou-links-"));
  await fs.mkdir(path.join(rootDir, "blog", "posts", "sample"), { recursive: true });
  await fs.writeFile(path.join(rootDir, "blog", "index.html"), '<a href="/missing.html">存在しないページ</a>', "utf8");
  await fs.writeFile(path.join(rootDir, "blog", "posts", "sample", "index.html"), '<a href="/blog/">一覧</a>', "utf8");

  await assert.rejects(
    () => checkBlogLinks({ rootDir }),
    /リンク先が存在しません \(\/missing\.html\)/
  );
});
