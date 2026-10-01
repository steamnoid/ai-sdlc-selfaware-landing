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
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

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
	],
};

/** Build the page from a state, and hand back the path and the words. */
function the_page_built_from(a_state) {
	const a_directory = mkdtempSync(join(tmpdir(), "ai-sdlc-selfaware-"));
	const the_state_file = join(at, "src", "state", "the_family.json");
	const there_was_a_state = existsSync(the_state_file);
	const what_was_there = there_was_a_state ? readFileSync(the_state_file, "utf8") : null;
	const what_was_in_the_directory = what_the_state_directory_holds();

	if (a_state !== null) {
		mkdirSync(join(at, "src", "state"), { recursive: true });
		writeFileSync(the_state_file, `${JSON.stringify(a_state, null, "\t")}\n`);
	} else {
		rmSync(join(at, "src", "state"), { recursive: true, force: true });
	}
	try {
		const the_build = spawnSync(
			process.execPath,
			[join(at, "node_modules", "astro", "bin", "astro.mjs"), "build", "--outDir", a_directory],
			{ cwd: at, encoding: "utf8" },
		);
		assert.equal(the_build.status, 0, `the page did not build, and said:\n${the_build.stdout}\n${the_build.stderr}`);
		return {
			where: join(a_directory, "index.html"),
			markup: readFileSync(join(a_directory, "index.html"), "utf8"),
			words: the_words_in(readFileSync(join(a_directory, "index.html"), "utf8")),
			also_written: existsSync(join(a_directory, "the_family.json")),
			afterwards: () => {
				rmSync(a_directory, { recursive: true, force: true });
			},
		};
	} finally {
		put_the_directory_back(what_was_in_the_directory);
		if (what_was_there !== null) {
			mkdirSync(join(at, "src", "state"), { recursive: true });
			writeFileSync(the_state_file, what_was_there);
		}
	}
}

/** Every file in the state directory, so the tree is put back as it was found. */
function what_the_state_directory_holds() {
	const a_directory = join(at, "src", "state");
	if (!existsSync(a_directory)) {
		return [];
	}
	return readdirSync(a_directory).map((a_name) => [a_name, readFileSync(join(a_directory, a_name), "utf8")]);
}

function put_the_directory_back(what_was_there) {
	const a_directory = join(at, "src", "state");
	rmSync(a_directory, { recursive: true, force: true });
	if (what_was_there.length === 0) {
		return;
	}
	mkdirSync(a_directory, { recursive: true });
	for (const [a_name, what_it_held] of what_was_there) {
		writeFileSync(join(a_directory, a_name), what_it_held);
	}
}

/** The words of a piece of markup, with every tag turned into a space. */
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
		it("prints the project that could not be read, with the reason", () => {
			assert.match(the_page.words, /an_unreadable_project/, "a project that could not be read was dropped");
			assert.match(the_page.words, /not read — GitHub answered 403/, "the reason it could not be read is not on the page");
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