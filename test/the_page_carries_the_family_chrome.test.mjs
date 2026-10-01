/** The page carries the chrome its family uses, and not a chrome of its own.
 *
 * **The contract is written here rather than read from a sibling.** There is no mechanism in this
 * family for one repository's suite to open another one's files: every landing deploys its own
 * Pages site from its own clone, so CI has no sibling on disk and a test that looked for one would
 * either skip or need a fixture. So the family's chrome is written down once, here, and every
 * repository asserts the same values against its own built page. If this file and a sibling's
 * header ever disagree, the failure says which sibling to diff against — but the test is green or
 * red on its own, in its own CI, with nothing beside it.
 *
 * **Where the values come from.** `ai-sdlc-os-landing` and `ai-sdlc-landing` agree on every one of
 * them, so they are the pair the contract is taken from. `ai-sdlc-bestof-landing` has a third nav
 * and a fourth favicon; `ai-sdlc-app-rs-plus-landing` is a deliberately dark page and is not in
 * this family at all. Two pages agreeing is what makes a contract, and this file names the pair so
 * a reader can check it rather than trust it.
 *
 * **No `Layout.astro`, and that is deliberate.** Four repositories in this family write their chrome
 * into `index.astro` and none of them has a layout component. Extracting one here would make this
 * the fifth page and the first component — a shared layout with four copies of the chrome still
 * inline and no way for a sibling to use it. The chrome is what is shared, not a file.
 */

import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { build_the_page } from "./build_the_page.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const at = join(here, "..");

/** The chrome `ai-sdlc-os-landing` and `ai-sdlc-landing` both carry. */
const THE_FAMILY_CHROME = {
	// **The page's paper.** `#fafaf9` is a warm off-white, `bg-white` is a different page to read.
	// The selection colours are the other half: they turn the browser's text selection into the
	// family's own mark, and this page had neither.
	body: "bg-[#fafaf9] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white",

	// **Sticky, blurred and 56 pixels tall.** This page's header scrolled away and was `py-6` tall,
	// so the navigation was the one part of the page that moved while you read.
	header: "sticky top-0 z-50 backdrop-blur bg-white/85 border-b border-zinc-200",
	header_bar: "max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4",

	// **Hidden below `md`, `text-sm`, `gap-6`, and `shrink-0`.** The nav does not wrap and does not
	// push the mark off the bar when a page has five sections.
	nav: "hidden md:flex items-center gap-6 text-sm text-zinc-600 shrink-0",
	nav_link: "hover:text-zinc-900 transition",

	// **The mark every page in the family carries, letter for letter.** `bestof-landing` spells its
	// own — `BE` — and that is the only page here that is not this system.
	mark: "w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold tracking-widest shrink-0",
	mark_text: "ASD",

	// **The author, which is how a reader of a generated page knows who to ask.** It sits between
	// the description and `og:type`, and the order is the family's because two pages wrote it that
	// way.
	author: "Krzysztof Paliga",
};

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

/** The page's own markup, built from a state, through the family's shared build helper. */
function the_page_built_from(a_state) {
	const a_directory = mkdtempSync(join(tmpdir(), "ai-sdlc-chrome-"));
	try {
		return readFileSync(build_the_page(at, a_directory, { write: a_state }), "utf8");
	} finally {
		rmSync(a_directory, { recursive: true, force: true });
	}
}

/** The class of one element, or null when the element is not on the page at all. */
const the_class_of = (a_piece_of_markup, a_tag) =>
	a_piece_of_markup.match(new RegExp(`<${a_tag} class="([^"]*)"`))?.[1] ?? null;

describe("the chrome of a page in this family", () => {
	const the_page = the_page_built_from(THE_STATE);

	it("is the family's paper, and marks the selection", () => {
		assert.equal(
			the_class_of(the_page, "body"),
			THE_FAMILY_CHROME.body,
			"the page is on different paper from every other page in the family. Diff the header of " +
				"this file against ai-sdlc-os-landing or ai-sdlc-landing — the contract above was taken " +
				"from the pair that agree.",
		);
	});

	it("has a header that stays where you can reach it", () => {
		assert.equal(
			the_class_of(the_page, "header"),
			THE_FAMILY_CHROME.header,
			"the header scrolls away on this page and stays on every other, so the navigation is the " +
				"one thing on the page that moves while you read it",
		);
	});

	it("has a navigation of the family's size, weight and spacing", () => {
		assert.equal(
			the_class_of(the_page, "nav"),
			THE_FAMILY_CHROME.nav,
			"the navigation is not the family's. It is smaller, greyer, tighter, and it does not step " +
				"aside on a narrow screen.",
		);
	});

	it("carries the family's mark, letter for letter", () => {
		assert.equal(
			the_class_of(the_page, "mark") ?? the_page.match(/class="([^"]*rounded-md bg-zinc-900[^"]*)"/)?.[1] ?? null,
			THE_FAMILY_CHROME.mark,
			"the square mark in the corner is not the family's, so two pages in the same family open " +
				"with a different letter on them",
		);
		assert.match(
			the_page,
			new RegExp(`>\\s*${THE_FAMILY_CHROME.mark_text}\\s*<`),
			`the mark should read "${THE_FAMILY_CHROME.mark_text}" — the family's initialism, and the ` +
				"only thing about this page's chrome that says which system it belongs to",
		);
	});

	it("names who wrote it, between the description and the Open Graph block", () => {
		assert.match(
			the_page,
			new RegExp(`name="author" content="${THE_FAMILY_CHROME.author}"`),
			"a reader of a page whose every number is generated has no author on it. The family puts " +
				"this between the description and og:type.",
		);
		const where_the_description_is = the_page.indexOf('name="description"');
		const where_the_author_is = the_page.indexOf('name="author"');
		const where_the_open_graph_is = the_page.indexOf('property="og:type"');
		assert.ok(
			where_the_description_is < where_the_author_is && where_the_author_is < where_the_open_graph_is,
			"the author meta is in the family's place and not elsewhere, because two pages wrote it in " +
				"this order and a third reading is a third order",
		);
	});

	it("keeps the footer's three sentences, which are already the family's", () => {
		for (const a_phrase of ["No tracking", "No cookies", "Nothing hand-typed"]) {
			assert.ok(the_page.includes(a_phrase), `the footer lost "${a_phrase}", which the family prints on every page`);
		}
	});
});