/** Building the page, and asking it whether what it says is what the state holds.
 *
 * **The page is built rather than inspected.** Astro's frontmatter is TypeScript run through Vite,
 * so the only place a template's own arithmetic exists is the built artefact. Testing the
 * components would test Astro.
 *
 * **Every reading here is a fixture the test wrote down**, which is the whole reason this
 * repository has no network in its default suite and the reason a build with no state at all is
 * one of the cases: a page that has never been built is a page nobody has looked at, and this
 * family has found nine sentences that were wrong only in readings nothing produces.
 */

import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { build_the_page, the_words_on_the_page } from "./build_the_page.mjs";
import { what_the_page_says } from "../src/page/what_the_page_says.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const at = join(here, "..");

/** A project as the reading holds it, with a tracker that has something on it. */
const a_project = (over = {}) => ({
	owner: "steamnoid",
	name: "a_project",
	url: "https://github.com/steamnoid/a_project",
	a_copy_of: "the-project-it-copies",
	was_read: true,
	why_not: null,
	what_it_says_it_is: "The copy this system works on: its own codebase.",
	was_created_on: "2026-10-01T00:00:00Z",
	the_issues: [
		{
			number: 1,
			title: "an opportunity the filing agent wrote",
			state: "open",
			created_at: "2026-10-01",
			closed_at: null,
			carries_the_filing_format: true,
			labels: [],
			was_written_by_somebody: "somebody",
		},
		{
			number: 2,
			title: "an opportunity written as prose",
			state: "closed",
			created_at: "2026-10-01",
			closed_at: "2026-10-03",
			carries_the_filing_format: false,
			labels: [],
			was_written_by_somebody: "somebody",
		},
	],
	the_pull_requests: [
		{
			number: 3,
			title: "a delivery a run made",
			branch: "aisdlc/issue-1-4f2a9c",
			state: "closed",
			was_merged: "2026-10-02",
			created_at: "2026-10-01",
			on_a_delivery_branch: true,
			labels: [],
			was_written_by_somebody: "somebody",
		},
		{
			number: 4,
			title: "a change somebody pushed by hand",
			branch: "docs/what-a-run-has-to-be-told",
			state: "closed",
			was_merged: null,
			created_at: "2026-10-01",
			on_a_delivery_branch: false,
			labels: [],
			was_written_by_somebody: "somebody",
		},
	],
	...over,
});

/** A state holding the six, so the page's own counts have something to count. */
const THE_STATE = {
	the_build: { read_at: "2026-10-01T09:00:00.000Z" },
	the_family: [
		a_project(),
		a_project({ name: "a_second_project", a_copy_of: "another-project", the_issues: [], the_pull_requests: [] }),
		a_project({ name: "an_unreadable_project", was_read: false, why_not: "GitHub answered 403", the_issues: [], the_pull_requests: [] }),
		a_project({ name: "another_unreadable_project", was_read: false, why_not: "the repository answered 404", the_issues: [], the_pull_requests: [] }),
	],
};

/** The page built from a state, through the family's shared build helper. */
function the_page_built_from(a_state) {
	const a_directory = mkdtempSync(join(tmpdir(), "ai-sdlc-selfaware-"));
	const where_it_lands = a_state === null
		? build_the_page(at, a_directory, { none: true })
		: build_the_page(at, a_directory, { write: a_state });
	/** Everything is read before the directory goes, because a helper that returns a path into a
	 * directory this function then deletes is a path to nothing. */
	const what_the_build_said = {
		where: where_it_lands,
		markup: readFileSync(where_it_lands, "utf8"),
		words: the_words_on_the_page(where_it_lands),
		also_written: existsSync(join(a_directory, "the_family.json")),
	};
	rmSync(a_directory, { recursive: true, force: true });
	return what_the_build_said;
}

/**
 * Markup as words.
 *
 * **Not the shared helper's function, which reads a path.** One test here looks at a *slice* of the
 * page — the lines around a hand-named pull request — and asking for a file to read back for a
 * fragment of a string already in hand would be a round trip to nowhere.
 */
function the_words_in(a_piece_of_markup) {
	return a_piece_of_markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

/**
 * What the page must print, counted out of the state rather than typed here.
 *
 * **The first version of this file typed 3 issues, 3 pull requests and "1 of 6", and all three
 * were wrong** — the fixture holds two issues and two pull requests on one project and nothing on
 * the others. A hand-typed number in a test is a claim about the page, and this page's whole rule
 * is that such a claim cannot be checked; a test that does it has the same disease as the sentence
 * it is checking.
 */
const the_read_projects = THE_STATE.the_family.filter((a_project) => a_project.was_read);
const every_issue = the_read_projects.flatMap((a_project) => a_project.the_issues);
const every_pull_request = the_read_projects.flatMap((a_project) => a_project.the_pull_requests);
const every_item = [...every_issue, ...every_pull_request];
const how_many_issues = every_issue.length;
const how_many_open = every_issue.filter((an_issue) => an_issue.state === "open").length;
const how_many_with_the_shape = every_issue.filter((an_issue) => an_issue.carries_the_filing_format).length;
const how_many_pull_requests = every_pull_request.length;
const how_many_merged = every_pull_request.filter((a_pull) => a_pull.was_merged !== null).length;
const how_many_delivered = every_pull_request.filter((a_pull) => a_pull.on_a_delivery_branch === true).length;

describe("a page built from a state that was read", () => {
	const the_page = the_page_built_from(THE_STATE);

	describe("and every number on it is the number the state holds", () => {
		it("prints how many issues and how many pull requests, from the items", () => {
			assert.match(the_page.words, new RegExp(`\\b${how_many_issues} issues\\b`), "the page does not say how many issues the state holds");
			assert.match(the_page.words, new RegExp(`\\b${how_many_pull_requests} pull requests\\b`), "the page does not say how many pull requests");
			assert.match(the_page.words, new RegExp(`\\b${how_many_merged} merged\\b`), "the page does not say how many were merged");
			assert.match(the_page.words, new RegExp(`${how_many_open} still open`), "the page does not say how many are still open");
		});

		it("prints how many a run can be shown to have made, from the branches", () => {
			assert.match(
				the_page.words,
				new RegExp(`${how_many_delivered} pull requests a run can be shown to have made`),
				"the page does not print the one count this whole page is about. One of the pull requests " +
					"is on a branch a delivery uses and the other is not, and that is the finding the " +
					"page exists to state.",
			);
		});

		it("prints how many carry the filing agent's shape, out of every item", () => {
			assert.match(
				the_page.words,
				new RegExp(`${how_many_with_the_shape}\\s+of ${every_item.length}`),
				"the page does not say how many items carry the filing agent's shape, out of all of them. " +
					"A shape is the only attribution signal these trackers hold, and it is worth one number.",
			);
		});
	});

	describe("and it says what it cannot tell you, before the counts", () => {
		it("leads with the signals and what they were worth", () => {
			const where = the_page.markup.indexOf('id="attribution"');
			assert.notEqual(where, -1, "the page has no section saying what it cannot tell you");
			assert.ok(
				where < the_page.markup.indexOf('id="loop"'),
				"the section saying what cannot be told comes after the counts, so a reader has already " +
					"read fifteen numbers as deliveries before being told the trackers do not record it",
			);
		});

		it("never says a hand-named pull request was delivered", () => {
			const the_claims = the_words_in(
				the_page.markup.slice(the_page.markup.indexOf("a change somebody pushed by hand") - 400),
			);
			assert.doesNotMatch(
				the_claims,
				/delivered by a run/i,
				"the page prints a delivery claim beside a pull request on a hand-named branch",
			);
		});

		it("says cannot be told wherever the tracker does not record it", () => {
			assert.match(
				the_page.words,
				/cannot be told from the tracker/,
				"the page never says the word where an item's author is unknown, so nothing on it says the " +
					"attribution is absent rather than merely unstated",
			);
		});
	});

	describe("and every project keeps its place", () => {
		it("prints every project that could not be read, with its own reason", () => {
			assert.match(the_page.words, /an_unreadable_project/, "a project that could not be read was dropped");
			assert.match(the_page.words, /not read — GitHub answered 403/, "the reason one could not be read is not on the page");
			assert.match(the_page.words, /not read — the repository answered 404/, "the reason the other could not be read is not on the page");
		});

		it("quotes what each project says about itself, rather than summarising it", () => {
			assert.match(
				the_page.words,
				/The copy this system works on: its own codebase\./,
				"the description is not quoted as it stands. It is the only evidence about authorship on " +
					"this page, and a summary of it is not evidence.",
			);
		});

		it("says a project whose tracker is empty holds nothing, rather than printing an empty card", () => {
			assert.match(
				the_page.words,
				/Its tracker holds nothing/,
				"the copy with no issue and no pull request is a section with two empty columns under it, " +
					"which reads as a section that was considered and found nothing — rather than as a " +
					"finding, which is what an empty tracker on a copy is.",
			);
		});

		it("says how many pull requests are open and not merged, which is different from delivering none", () => {
			assert.match(
				the_page.words,
				/1 pull request open and not merged/,
				"a project with an unmerged pull request prints as one with no deliveries, and the two are " +
					"different facts a reader of a tracker would care about.",
			);
		});
	});

	describe("and the state is published beside it", () => {
		it("publishes the reading it was built from", () => {
			assert.equal(
				the_page.also_written,
				true,
				"the build produced a page with no reading beside it. Every claim on this page is a claim " +
					"about a tracker, and a reader cannot check one against a file that is not there.",
			);
		});
	});
});

/**
 * **Four projects, so the family count is a number no other sentence in the page uses.**
 *
 * The page says in words how many signals it checks — three — and how many people must approve an
 * answer — one. A fixture of three projects made the word for the family count identical to the word
 * for the signal count, and a rule that forbids a word cannot tell a count of copies from a count of
 * signals. Four cannot collide with either, so the rule below is about the family and nothing else.
 */

const NUMBER_WORDS = [
	"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
	"eleven", "twelve",
];

describe("and its own prose holds no number it did not count", () => {
	const the_page = the_page_built_from(THE_STATE);
	const how_many_copies = THE_STATE.the_family.length;

	it("counts the copies in its title, its label and its opening sentence", () => {
		assert.match(the_page.words, new RegExp(`${how_many_copies} copies`), "the page never says how many copies it is about in figures");
		assert.match(
			the_page.words,
			new RegExp(`${how_many_copies} of the projects on this page`),
			"the opening sentence does not carry the counted number",
		);
	});

	it("does not spell the number of copies as a word", () => {
		// **One word, and only the word this fixture's count is written as.** The first version
		// forbade every number word from zero to twelve, and it forbade good English: this page says
		// "has one person approve every answer" and "Not one on the 6 is on a branch like that", and
		// neither of those is a count of anything. A rule that cannot be told apart from ordinary
		// prose is a rule a writer learns to work around.
		const the_word = NUMBER_WORDS[how_many_copies];
		assert.doesNotMatch(
			the_page.words,
			new RegExp(`\\b${the_word}\\b`, "i"),
			`the page's own prose writes "${the_word}" where the number of copies belongs. Six sentences ` +
				"on the first live build said how many copies there are as a word, and those are exactly " +
				"the sentences that were wrong on ai-sdlc-landing the day a repository answered 404.",
		);
	});
});

describe("a page built with no state at all", () => {
	const the_page = the_page_built_from(null);

	it("builds, and says so in words rather than showing an empty family", () => {
		assert.match(
			the_page.words,
			/No state, so nothing to say/,
			"a fresh clone built a page with no tracker on it and no sentence saying so. The state is a " +
				"build artefact and is never committed, so this is the build every fresh clone does.",
		);
		assert.match(the_page.words, /npm run collect/, "the page does not say which command would give it something to say");
	});

	it("prints no value it was never given", () => {
		for (const a_thing of ["undefined", "NaN", "[object Object]"]) {
			assert.ok(
				!the_page.words.includes(a_thing),
				`the page printed ${a_thing}, which is what a field nobody read renders as`,
			);
		}
	});
});
/**
 * **A state that was read and held nothing is not a state that is missing.**
 *
 * These three sit in one branch in the projection: no file at all, a file holding no projects, and a
 * file holding an empty list. Two of them are genuinely different and both statements in that branch
 * are false for the second one — "no state at src/state/the_family.json" is a claim about the disk
 * while the file is on it, and "this is what a fresh clone has" is a claim about the renderer when
 * the other branch renders differently. It is the same defect this repository's sibling fixed an hour
 * before this file was written, in the same family, about the same words.
 */
describe("a state that was read and held no projects", () => {
	const what_it_says = what_the_page_says({
		the_build: { read_at: "2026-10-01T09:00:00.000Z" },
		the_family: [],
	});

	it("keeps the reading's own timestamp, so a reader knows the read happened", () => {
		assert.equal(
			what_it_says.when_was_it_read,
			"2026-10-01T09:00:00.000Z",
			"the projection drops the reading's timestamp when the reading held nothing, so the one " +
				"fact the state does hold — that it was read, and when — is the fact it throws away",
		);
	});
});

describe("a page built from a state that was read and held nothing", () => {
	const the_page = the_page_built_from({
		the_build: { read_at: "2026-10-01T09:00:00.000Z" },
		the_family: [],
	});

	it("does not print the no-state heading beside a reason saying the trackers were read", () => {
		assert.doesNotMatch(
			the_page.words,
			/No state, so nothing to say/i,
			"the page's heading claims there is no state while the sentence under it says the trackers " +
				"were read. Splitting the projection was half the fix: the heading was written into the " +
				"template as a literal, so it went on telling the first of the two stories regardless.",
		);
	});

	it("prints the reason the reading held nothing", () => {
		assert.match(the_page.words, /trackers were read and every one of them held nothing/, "the reason is not on the page");
		assert.match(the_page.words, /2026-10-01 09:00 UTC/, "the reading's own time is not on the page, so nothing says the read happened");
	});
});
