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

/** An issue as a tracker holds it: a number, a state, and a filing agent's shape or none. */
const an_issue = (an_index, over = {}) => ({
	number: an_index,
	title: `an opportunity ${an_index}`,
	state: "open",
	created_at: "2026-10-01",
	closed_at: null,
	carries_the_filing_format: true,
	labels: [],
	was_written_by_somebody: "somebody",
	...over,
});

/**
 * An original, holding thirty pull requests and — for the first one — an open issue and a closed
 * one.
 *
 * **The issues are here so the count has something to count.** Every original in the first version of
 * this fixture had none, which made "how many of their issues are open" a question whose answer was
 * always zero — and a test that asks about open issues against a fixture with no open issues proves
 * only that zero is printed.
 */
const an_original = (an_index, over = {}) => ({
	owner: "steamnoid",
	name: `an_original_number_${an_index}`,
	what_it_is: AN_ORIGINAL,
	url: "https://github.com/steamnoid/y",
	was_read: true,
	why_not: null,
	what_it_says_it_is: an_index === 1 ? null : "An AI-native SDLC that shows its working.",
	was_created_on: "2026-01-01T06:00:00Z",
	the_issues:
		an_index === 1
			? [an_issue(10), an_issue(11, { state: "closed", closed_at: "2026-02-01" })]
			: [],
	the_pull_requests: Array.from({ length: 30 }, (_, an_inner) => a_pull_request(an_inner)),
	...over,
});

const THE_COPIES = [1, 2, 3].map(a_copy);
const THE_ORIGINALS = [1, 2, 3].map(an_original);

/** The originals' issues, counted rather than written down. */
const every_issue_of_the_originals = THE_ORIGINALS.flatMap((an_original) => an_original.the_issues);
const how_many_issues_of_the_originals = every_issue_of_the_originals.length;
const how_many_open_of_the_originals = every_issue_of_the_originals.filter(
	(an_issue) => an_issue.state === "open",
).length;

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

/**
 * One row of the **originals'** table, as its cells read — so a column can be checked on its own.
 *
 * **Scoped to the section, and not searched across the page.** The first version looked for the
 * name anywhere and found it in the copies' table, in the "a copy of …" column — so it compared an
 * original's expected row against a copy's actual one and reported the two kinds of repository as
 * disagreeing. A lookup that can land on the wrong kind of thing is not a lookup.
 */
function the_row_of(a_piece_of_markup, a_name) {
	const the_section = a_piece_of_markup.slice(a_piece_of_markup.indexOf('id="originals"'));
	const where_it_starts = the_section.indexOf(`>${a_name}<`);
	const the_row = the_section.slice(
		the_section.lastIndexOf("<tr", where_it_starts),
		the_section.indexOf("</tr>", where_it_starts),
	);
	return [...the_row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((a_match) =>
		html_unescaped(a_match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()),
	);
}

const html_unescaped = (a_piece_of_markup) =>
	a_piece_of_markup.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

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

	it("says how many of their issues are still open, which is the number this section was missing", () => {
		assert.match(
			the_page.words,
			new RegExp(`${how_many_open_of_the_originals} open of ${how_many_issues_of_the_originals} on their trackers`),
			"the section that holds the originals' pull requests says nothing about their issues. It " +
				"counts merged and it counts deliveries and it never once mentions an issue — a reader " +
				"reaching the bottom of this page could not say whether any of the repositories the " +
				"system was built in has work still open.",
		);
	});

	/**
	 * **The Open column is a number and nothing else.**
	 *
	 * It said "the 1 open issue of 1" for one run, on the reasoning that a bare figure could not be
	 * acted on without its total. But the Issues column immediately to its left *is* that total, the
	 * copies' table above prints a bare figure in the same column, and every other column in this
	 * table is a bare figure — so the phrase was the only cell in the table that had to be read
	 * rather than scanned, and it said less than its neighbour did.
	 */
	it("puts a plain number in the Open column, as every other column in this table does", () => {
		const the_one_with_issues = THE_ORIGINALS[0];
		const how_many_of_its_issues_are_open = the_one_with_issues.the_issues.filter(
			(an_issue) => an_issue.state === "open",
		).length;

		const the_row = the_row_of(the_page.markup, the_one_with_issues.name);
		assert.deepEqual(
			the_row,
			[
				the_one_with_issues.name,
				`${the_one_with_issues.name} was copied into a_copy_number_1`,
				String(the_one_with_issues.the_issues.length),
				String(how_many_of_its_issues_are_open),
				"30",
				"30",
				// **This original is the one with no description**, on purpose — a second test asserts
				// the page says so in words rather than leaving the cell empty. The expectation is
				// taken from the fixture for the same reason every other number here is: writing the
				// wrong description in by hand is the mistake the fixture exists to catch.
				the_one_with_issues.what_it_says_it_is ?? "this repository has no description on GitHub",
			],
			"the row is not what this table's columns say it should be. Open is a plain count " +
				"alongside the total in Issues, and the two are different numbers — one issue open out " +
				"of two — which is the only situation in which the column says anything.",
		);
		assert.doesNotMatch(
			the_page.words,
			/the \d+ open issues? of \d+/,
			"a cell spells itself out where every other cell in the table is a figure",
		);
	});

	it("tells an open issue from a closed one in every row, as the copies' table above does", () => {
		assert.match(
			the_page.words,
			/The originals these copies were made from/,
			"the originals' table is not on the page at all, so there is no Open column in it",
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