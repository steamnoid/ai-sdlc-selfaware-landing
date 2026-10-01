/** The six trackers, and what can be read out of them.
 *
 * **Every reader in this file is a fixture.** A test that reached for api.github.com would be a
 * test that only runs sometimes, and this repository's rule is that the default suite touches no
 * network and needs no credential. So the reader is a parameter and the tests hand it one.
 *
 * **The fixtures are the real shapes, and two of them are the shapes that made the point.** A
 * repository whose issues are one line of prose each, and a repository whose filings carry the
 * filing agent's headings — because that difference is why this page has an attribution section at
 * all rather than a list of deliveries.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { carries_the_filing_format, is_a_delivery_branch, what_the_trackers_say } from "../scripts/ask_the_trackers.mjs";

/** What the reader answers for one repository, and what a filing's body looks like. */
const a_repository_whose_tracker_reads = (over = {}) => ({
	description: "The copy this system works on.",
	created_at: "2026-10-01T00:00:00Z",
	issues: [],
	pull_requests: [],
	...over,
});

/** A filing as the agent writes it: a heading, then named sections. */
const A_FILING_BODY = [
	"## The runner is npm-only and cannot verify this codebase",
	"",
	"**Why it is worth doing**",
	"",
	"Every constant that decides how a suite is run is npm.",
	"",
	"**How we would know it worked**",
	"",
	"A change to this repository is delivered.",
	"",
	"**Which discipline owns it**",
	"",
	"DEV",
].join("\n");

/** An opportunity written as prose, which is how the largest set of issues here reads. */
const A_PROSE_BODY =
	"The system reasons over code it cloned and does not own, and `pytest` exits zero when it " +
	"collects nothing. A green suite is the strongest signal this pipeline produces and the cheapest " +
	"to get wrong.";

/** A reader that answers from a table of fixtures, and refuses for anything it does not hold. */
function a_reader_holding(a_table) {
	return async (a_path) => {
		const found = a_table[a_path];
		if (found === undefined) {
			return { was_read: false, why_not: "answered 404", the_answer: null };
		}
		return { was_read: true, why_not: null, the_answer: found };
	};
}

/**
 * The URLs the collector asks for, page size and page number included.
 *
 * **They carry `page=` now, and this test had to follow.** The collector walks pages until one comes
 * back short, so every request now ends `&per_page=100&page=1` — and a fixture keyed on the old URL
 * answered nothing, which showed up as three tests failing about trackers holding items this
 * repository's own fixture says they do not hold. A test double that no longer matches the URL is
 * not a neutral thing: it is a test that stops asking.
 */
const the_issues_url = "repos/steamnoid/a_project/issues?state=all&per_page=100&page=1";
const the_pulls_url = "repos/steamnoid/a_project/pulls?state=all&per_page=100&page=1";
const the_itself_url = "repos/steamnoid/a_project";

/** One project as the hand-written list writes it, so a test is about the reading and not the shape. */
const A_PROJECT = { owner: "steamnoid", name: "a_project", a_copy_of: "the-project-it-copies" };

describe("a tracker read into a reading", () => {
	it("holds every issue, and every pull request, and names what it could not read", async () => {
		const the_reading = await what_the_trackers_say([A_PROJECT], a_reader_holding({
			[the_itself_url]: a_repository_whose_tracker_reads(),
			[the_issues_url]: [
				{ number: 1, title: "a filing", body: A_FILING_BODY, state: "open", created_at: "2026-10-01", closed_at: null, user: { login: "somebody" }, labels: [] },
				{ number: 2, title: "another", body: A_PROSE_BODY, state: "closed", created_at: "2026-10-01", closed_at: "2026-10-03", user: { login: "somebody" }, labels: [{ name: "a_label" }] },
			],
			[the_pulls_url]: [
				{ number: 3, title: "a delivery", state: "closed", merged_at: "2026-10-02", created_at: "2026-10-01", head: { ref: "aisdlc/issue-2-abc123" }, user: { login: "somebody" }, labels: [] },
			],
		}));

		const a_reading = the_reading[0];
		assert.equal(a_reading.was_read, true, `the project was refused: ${a_reading.why_not}`);
		assert.equal(a_reading.the_issues.length, 2, "an issue was not read");
		assert.equal(a_reading.the_pull_requests.length, 1, "a pull request was not read");
		assert.equal(a_reading.the_loop.how_many_issues_are_open, 1);
		assert.equal(a_reading.the_loop.how_many_were_merged, 1);
	});

	it("does not count a pull request as an issue, because GitHub's issue endpoint carries both", async () => {
		// **This is a number about somebody's work that a reader would otherwise take at face
		// value.** GitHub answers `issues` with issues *and* pull requests, so a collector that does
		// not filter them reports a project as having filed twice what it filed — on a page whose
		// whole subject is what it filed.
		const the_reading = await what_the_trackers_say([A_PROJECT], a_reader_holding({
			[the_itself_url]: a_repository_whose_tracker_reads(),
			[the_issues_url]: [
				{ number: 1, title: "a filing", body: A_PROSE_BODY, state: "open", created_at: "2026-10-01", closed_at: null, user: { login: "s" }, labels: [] },
				{ number: 7, title: "a delivery", state: "closed", created_at: "2026-10-01", closed_at: null, user: { login: "s" }, labels: [], pull_request: { url: "https://api.github.com/x" } },
			],
			[the_pulls_url]: [
				{ number: 7, title: "a delivery", state: "closed", merged_at: "2026-10-02", created_at: "2026-10-01", head: { ref: "a-branch" }, user: { login: "s" }, labels: [] },
			],
		}));

		assert.equal(
			the_reading[0].the_issues.length,
			1,
			"the pull request is counted as an issue as well as a pull request, so the page would say the " +
				"project filed two things when it filed one",
		);
	});

	it("keeps a project whose tracker cannot be read, and says why", async () => {
		const the_reading = await what_the_trackers_say([A_PROJECT], a_reader_holding({
			[the_itself_url]: a_repository_whose_tracker_reads(),
		}));

		assert.equal(the_reading[0].was_read, false, "a project with an unreadable tracker was printed as an empty one");
		assert.match(the_reading[0].why_not, /answered 404/, `the refusal does not carry the reason: ${the_reading[0].why_not}`);
		assert.equal(the_reading[0].the_loop, null, "a project that was not read carries a loop of counts");
	});

	it("distinguishes a project that cannot be read from one whose tracker is empty", async () => {
		const the_reading = await what_the_trackers_say([A_PROJECT], a_reader_holding({
			[the_itself_url]: a_repository_whose_tracker_reads(),
			[the_issues_url]: [],
			[the_pulls_url]: [],
		}));

		assert.equal(
			the_reading[0].was_read,
			true,
			"a repository whose tracker holds nothing is reported as unreadable. Those are two different " +
				"facts and the page says so in as many words.",
		);
		assert.equal(the_reading[0].the_loop.how_many_issues, 0);
	});
});

describe("what makes an item attributable, and what the two real shapes do", () => {
	it("reads a filing's shape as a shape and not as a record", () => {
		assert.equal(
			carries_the_filing_format(A_FILING_BODY),
			true,
			"a body written the way the filing agent writes it is not recognised, so the one signal this " +
				"page has for attribution reports nothing",
		);
		assert.equal(
			carries_the_filing_format(A_PROSE_BODY),
			false,
			"a paragraph of prose is reported as carrying the filing agent's shape. The largest set of " +
				"issues on these trackers reads exactly like this, and counting it would be a claim " +
				"about somebody's work.",
		);
	});

	it("refuses a body with a heading and no sections, rather than half-counting it", () => {
		assert.equal(
			carries_the_filing_format("## A title\n\nA paragraph that happens to follow a heading."),
			false,
			"a heading alone was treated as the filing agent's shape. A section list is what the agent " +
				"writes and a heading is what a person writes too.",
		);
	});

	it("refuses a body with sections and no heading, which is not the shape either", () => {
		assert.equal(
			carries_the_filing_format("Why it is worth doing\n\nAnd a paragraph. Which discipline owns it."),
			false,
		);
	});

	it("reads a delivery branch by its convention and nothing looser", () => {
		assert.equal(is_a_delivery_branch("aisdlc/issue-12-4f2a9c"), true, "the delivery convention is not recognised");
		assert.equal(is_a_delivery_branch("aisdlc/issue-12"), true, "the convention without a run id is the same convention");
		assert.equal(
			is_a_delivery_branch("aisdlc/issue-12-someone-elses-work"),
			false,
			"a branch that starts like a delivery branch was read as one. The suffix is a run id and " +
				"this is the rule that would let a hand-made branch claim a delivery.",
		);
		assert.equal(is_a_delivery_branch("docs/what-a-run-has-to-be-told"), false);
		assert.equal(is_a_delivery_branch("aisdlc/not-an-issue"), false);
	});
});
