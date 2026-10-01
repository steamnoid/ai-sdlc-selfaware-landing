/** Every file the page points at is a file the build actually produced.
 *
 * **This is the test that a page can be green and still be broken.**
 *
 * The page carried the family's chrome — the paper, the sticky header, the mark, the navigation —
 * and every test in the family that looks at the page passed, because all of them read the markup.
 * The markup said `class="bg-[#fafaf9] …"` and it was true. The browser never applied any of it: the
 * stylesheet was requested from `/ai-sdlc-landing/_astro/…` — the sibling's address, inherited in a
 * config file copied from it — and GitHub answered 404, because this page is not served from there.
 * The live page was an unstyled wall of text for as long as it took to read this file's name.
 *
 * **Asserting the markup is not asserting the page.** A class name is a claim the template makes; a
 * stylesheet that loads is a claim the deployment has to keep. Only the second one is what a reader
 * sees, and nothing in this repository looked at it until now.
 *
 * **The rule is the general one rather than the one that broke.** Every absolute path in the built
 * page must resolve to a file the same build produced — stylesheets, scripts, favicon, the published
 * state. That catches a wrong `base`, a missing copy, and anything a future change adds, without
 * naming this one incident.
 */

import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { build_the_page } from "./build_the_page.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const at = join(here, "..");

/** Where this page is served from, which is a fact about the repository and not about the page. */
const WHERE_THIS_PAGE_LIVES = "/ai-sdlc-selfaware-landing";

const THE_STATE = {
	the_build: { read_at: "2026-10-01T09:00:00.000Z" },
	the_family: [
		{
			owner: "steamnoid",
			name: "ai-sdlc-os-selfaware",
			what_it_is: "a copy the system briefs itself against",
			a_copy_of: "ai-sdlc-os",
			url: "https://github.com/steamnoid/ai-sdlc-os-selfaware",
			a_copy_of: "ai-sdlc-os",
			was_read: true,
			why_not: null,
			what_it_says_it_is: "The original, on its own tracker.",
			was_created_on: "2026-10-01T06:18:55Z",
			the_issues: [],
			the_pull_requests: [],
		},
	],
};

/** Every absolute path the page asks for, from `href` and from `src`. */
const every_file_the_page_asks_for = (a_piece_of_markup) =>
	[...a_piece_of_markup.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((a_match) => a_match[1]);

describe("a page built from a state that was read", () => {
	const a_directory = mkdtempSync(join(tmpdir(), "ai-sdlc-assets-"));
	const where_the_page_landed = build_the_page(at, a_directory, { write: THE_STATE });
	const the_markup = readFileSync(where_the_page_landed, "utf8");
	const what_it_asks_for = every_file_the_page_asks_for(the_markup);

	it("points at files the build produced, and not at files it did not", () => {
		assert.ok(what_it_asks_for.length > 0, "the page asks for no file at all, which is what an unstyled page looks like to a browser");

		/**
		 * **The base is stripped, because deployment is what adds it.**
		 *
		 * The build writes `_astro/index.css` and the page asks for
		 * `/ai-sdlc-selfaware-landing/_astro/index.css`. Those agree once GitHub serves this
		 * repository's output from that address, and they disagree inside the directory the build
		 * produced — so a first version of this test resolved the path as written and reported the
		 * build's own correct output as missing.
		 */
		const what_is_missing = what_it_asks_for.filter((a_path) => {
			const where_it_lands_in_the_build = a_path.startsWith(`${WHERE_THIS_PAGE_LIVES}/`)
				? a_path.slice(WHERE_THIS_PAGE_LIVES.length)
				: a_path;
			return !existsSync(join(a_directory, where_it_lands_in_the_build.replace(/^\//, "")));
		});
		assert.deepEqual(
			what_is_missing,
			[],
			"the built page asks for files this build never wrote:\n  " +
				what_is_missing.join("\n  ") +
				"\n\nA browser 404s on every one of them and shows the page unstyled, with no error " +
				"anywhere on this side of the deployment to say so.",
		);
	});

	it("is served from this repository's address and not a sibling's", () => {
		const the_wrong_one = what_it_asks_for.find((a_path) => !a_path.startsWith(`${WHERE_THIS_PAGE_LIVES}/`));
		assert.equal(
			the_wrong_one,
			undefined,
			`the page asks for "${the_wrong_one}", which is not under ${WHERE_THIS_PAGE_LIVES}. ` +
				"`base` in astro.config.mjs is where a page says it lives, and a config copied from a " +
				"sibling carries that sibling's address — which is how a page published correctly and " +
				"served without a single style.",
		);
	});

	it("asks for the state it was built from, beside the page", () => {
		const where_the_state_is = join(a_directory, "the_family.json");
		assert.ok(existsSync(where_the_state_is), "the reading was not published beside the page");
		assert.ok(
			statSync(where_the_state_is).size > 2,
			"the published reading is a stand-in, so every number on the page is checked against nothing",
		);
	});
});

function readFileSyncSafe(a_path) {
	return require("node:fs").readFileSync(a_path, "utf8");
}