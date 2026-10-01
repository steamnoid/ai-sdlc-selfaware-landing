/** The page shows two kinds of repository, and adds their numbers to nothing.
 *
 * **The sharpest test in this repository, and it is a comparison rather than a claim.**
 *
 * Two pages are built: one from seven copies, and one from those seven copies plus the seven
 * originals they were made from. Every figure about the workflow — the title, the summary line, the
 * three signals of what the trackers cannot say — has to come out identical. If adding the
 * originals moves any of them, this repository is counting somebody's pull request as a delivery,
 * which is the one thing the whole page exists not to do.
 *
 * The originals' own numbers are then required to be *present* rather than absent, because a page
 * whose rule is "a fact is generated, or it is not on the page" cannot also be entitled to hide
 * four hundred real changes it finds inconvenient. They are counted, printed, and labelled as the
 * projects' own development.
 */

import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { build_the_page, the_words_on_the_page } from "./build_the_page.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const at = join(here, "..");

const A_COPY = "a copy the system briefs itself against";
const AN_ORIGINAL = "the original a copy was made from";

const a_pull_request = (an_index, over = {}) => ({
	number: 100 + an_index,
	title: `a change somebody pushed by hand, number ${an_index}`,
	branch: `docs/something-${an_index}`,
	state: "closed",
	was_merged: "2026-01-01",
	created_at: "2025-06-01",
	on_a_delivery_branch: false,
	labels: [],
	was_written_by_somebody: "somebody",
	...over,
});

const a_copy = (an_index) => ({
	owner: "steamnoid",
	name: `a_copy_number_${an_index}`,
	what_it_is: A_COPY,
	a_copy_of: `an_original_number_${an_index}`,
	url: "https://github.com/steamnoid/x",
	was_read: true,
	why_not: null,
	what_it_says_it_is: "The copy this system works on: its own codebase.",
	was_created_on: "2026-10-01T06:00:00Z",
	the_issues: [
		{
			number: an_index,
			title: "an opportunity the filing agent wrote",
			state: "open",
			created_at: "2026-10-01",
			closed_at: null,
			carries_the_filing_format: true,
			labels: [],
			was_written_by_somebody: "somebody",
		},
	],
	the_pull_requests: [
		a_pull_request(an_index, {
			branch: `aisdlc/issue-${an_index}-4f2a9c`,
			on_a_delivery_branch: true,
			was_merged: "2026-10-02",
		}),
	],
});

const an_original = (an_index, over = {}) => ({
	owner: "steamnoid",
	name: `an_original_number_${an_index}`,
	what_it_is: AN_ORIGINAL,
	url: "https://github.com/steamnoid/y",
	was_read: true,
	why_not: null,
	what_it_says_it_is: an_index === 1 ? null : "An AI-native SDLC that shows its working.",
	was_created_on: "2026-01-01T06:00:00Z",
	the_issues: [],
	the_pull_requests: Array.from({ length: 30 }, (_, an_inner) => a_pull_request(an_inner)),
	...over,
});

const THE_COPIES = [1, 2, 3].map(a_copy);
const THE_ORIGINALS = [1, 2, 3].map(an_original);

/** The page, as words, from a family of the given repositories. */
function the_page_from(a_family) {
	const a_directory = mkdtempSync(join(tmpdir(), "ai-sdlc-two-kinds-"));
	try {
		const where_it_lands = build_the_page(at, a_directory, {
			write: { the_build: { read_at: "2026-10-01T09:00:00.000Z" }, the_family: a_family },
		});
		return {
			markup: readFileSync(where_it_lands, "utf8"),
			words: the_words_on_the_page(where_it_lands),
		};
	} finally {
		rmSync(a_directory, { recursive: true, force: true });
	}
}

/** The figures that are about the workflow, and which the originals must not move. */
const the_figures_about_the_workflow = (a_page) => ({
	copies_in_the_title: a_page.markup.match(/— (\d+) copies/)?.[1],
	"issues on their trackers": a_page.words.match(/(\d+) issues on their trackers/)?.[1],
	"still open": a_page.words.match(/(\d+) still open/)?.[1],
	merged: a_page.words.match(/pull requests, (\d+) merged/)?.[1],
	delivered_by_a_run: a_page.words.match(/(\d+) pull requests a run can be shown to have made/)?.[1],
	on_a_delivery_branch: a_page.words.match(/Pull requests on a delivery branch (\d+) of (\d+)/)?.slice(1).join(" of "),
	people: a_page.words.match(/People who wrote anything (\d+)/)?.[1],
});

describe("a page built from copies alone, and from copies plus the originals they were made from", () => {
	const copies_only = the_page_from(THE_COPIES);
	const with_originals = the_page_from([...THE_COPIES, ...THE_ORIGINALS]);

	it("every figure about the workflow is the same on both", () => {
		assert.deepEqual(
			the_figures_about_the_workflow(with_originals),
			the_figures_about_the_workflow(copies_only),
			"adding the originals changed a number about the workflow. Their trackers hold three " +
				"hundred and sixty merged pull requests of human work, and the page has just counted " +
				"some of them as deliveries.",
		);
	});

	it("and every figure was found, so the comparison above was not between two absences", () => {
		const what_it_found = the_figures_about_the_workflow(with_originals);
		for (const [a_figure, a_value] of Object.entries(what_it_found)) {
			assert.notEqual(a_value, undefined, `the page does not print "${a_figure}", so comparing it would pass for the wrong reason`);
		}
	});
});

describe("the section for the originals", () => {
	const the_page = the_page_from([...THE_COPIES, ...THE_ORIGINALS]);

	it("exists, and is not the section about deliveries", () => {
		assert.match(the_page.markup, /id="originals"/, "the page has no section for the repositories the copies were made from");
		assert.match(
			the_page.words,
			/The originals these copies were made from/,
			"the originals' section does not say what the section is about",
		);
	});

	it("counts their pull requests, and says how many a run made", () => {
		assert.match(
			the_page.words,
			/90 pull requests across 3 originals/,
			"the originals' own pull requests are not counted. Ninety real changes to the system, " +
				"printed as nothing, because printing them next to the copies' counts would have been " +
				"the wrong place to start.",
		);
		assert.match(
			the_page.words,
			/0 pull requests a run made on them/,
			"the originals' section does not say how many of their pull requests were deliveries, and " +
				"that number is the whole reason they are a separate section",
		);
	});

	it("says plainly that their numbers are not added to the deliveries above", () => {
		assert.match(
			the_page.words,
			/not added to the counts above/,
			"nothing stops a reader adding ninety to three. This page's own rule is that every number " +
				"is generated, and a reader who has to do the arithmetic is doing what this page refuses to do.",
		);
	});

	it("names what each original was copied into", () => {
		assert.match(
			the_page.words,
			/an_original_number_1 was copied into a_copy_number_1/,
			"an original does not say which copies were made from it, so the row is a repository with " +
				"no argument for being on the page",
		);
	});

	it("says an original has no description rather than leaving the cell empty", () => {
		assert.match(
			the_page.words,
			/no description on GitHub/,
			"one of the originals has no description at all, and an empty cell cannot be told from a " +
				"description that was never asked for",
		);
	});
});

describe("what the page claims about the repositories", () => {
	const the_page = the_page_from([...THE_COPIES, ...THE_ORIGINALS]);

	it("claims nothing about what the descriptions say", () => {
		assert.doesNotMatch(
			the_page.words,
			/[Ee]ach copy's own description says/i,
			"the page states what every description says. One copy in this family describes isolation " +
				"and pairwise testing and says nothing about the system working on it, so the sentence " +
				"is false the moment the seventh arrives.",
		);
		assert.doesNotMatch(
			the_page.words,
			/description says the system works on/i,
			"the page asserts that the descriptions say a particular thing, and no description on this " +
				"page was checked for saying it",
		);
	});

	it("quotes each description as it stands, which is the claim it can make", () => {
		assert.match(
			the_page.words,
			/The copy this system works on: its own codebase\./,
			"a description is not quoted as it stands, so the page has replaced the only statement " +
				"about authorship that its subject actually makes",
		);
		assert.match(
			the_page.words,
			/An AI-native SDLC that shows its working\./,
			"an original's description is not quoted",
		);
	});

	it("says how many repositories are on the page, of both kinds", () => {
		assert.match(
			the_page.words,
			/6 repositories, 3 of them working on themselves/,
			"the page does not say how many repositories it is about, so \"all of them\" in the next " +
				"sentence has no referent",
		);
	});
});