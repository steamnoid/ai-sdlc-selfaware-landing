/** The collector asks for the next page whenever a page comes back full.
 *
 * **A tracker holding exactly one page of items is the shape of a truncated tracker.**
 *
 * GitHub serves a hundred items per page and says nothing about whether more exist beyond the one
 * that was fetched. This collector asked for `per_page=100` once per endpoint and counted what came
 * back, which is right for thirteen of the fourteen repositories on this page and wrong for two:
 * `ai-sdlc-os-plus` and `ai-sdlc-app-rs-plus` both answered with exactly a hundred pull requests,
 * which is not a measurement of either repository — it is the size of the envelope the answer came
 * in. The live page said 404 pull requests across the originals, and the true figure was larger.
 *
 * **Nothing in the output said so.** A truncated count is smaller than the truth, which means it
 * looks like a finding rather than a failure: a page about what a workflow delivered, quietly
 * under-reporting somebody else's work, and no red anything. That is the whole reason this file
 * exists.
 *
 * **The rule is that a full page is not an answer, it is a question.** A page shorter than the size
 * asked for ends the reading; a page exactly as long as was asked for means there may be more, so
 * the next page is requested. A repository that genuinely holds exactly a hundred items ends on an
 * empty second page — so after this, a count of exactly 100 is a count and no longer a symptom.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { what_the_trackers_say } from "../scripts/ask_the_trackers.mjs";

const A_COPY = "a copy the system briefs itself against";

/** An issue GitHub would serve, and a pull request likewise, distinguishable by what they carry. */
const an_issue = (an_index) => ({
	number: an_index,
	title: `an opportunity ${an_index}`,
	state: "open",
	created_at: "2026-10-01",
	closed_at: null,
	body: "",
	labels: [],
	user: { login: "somebody" },
	pull_request: undefined,
});

const a_pull_request = (an_index) => ({
	number: an_index,
	title: `a change ${an_index}`,
	created_at: "2026-10-01",
	merged_at: "2026-10-02",
	head: { ref: `docs/something-${an_index}` },
	labels: [],
	user: { login: "somebody" },
});

const a_project = { owner: "steamnoid", name: "a_repository", what_it_is: A_COPY, a_copy_of: "an_original" };

/** A reader that serves the items it is given, one page at a time, and records what it was asked. */
function a_reader_serving(the_pages, a_log = []) {
	return async (a_path) => {
		a_log.push(a_path);
		if (a_path === "repos/steamnoid/a_repository") {
			return { was_read: true, why_not: null, the_answer: { description: "a copy", created_at: "2026-10-01T00:00:00Z" } };
		}
		const is_issues = a_path.includes("/issues");
		const the_kind = is_issues ? "issues" : "pulls";
		// **The page number is read after the page size, or \ in \ is
		// mistaken for it.** The first version of this reader matched the wrong parameter and every
		// page it served was the first one — so a test about reading past the first page was, for one
		// run, a test that never left it.
		const the_page = a_path.match(/[?&]page=(\d+)/)?.[1] ?? "1";
		const what_it_holds = the_pages[`${the_kind}:${the_page}`] ?? [];
		const what_it_serves = what_it_holds.map((an_item, an_index) =>
			is_issues ? an_issue(Number(an_item) + 1) : a_pull_request(Number(an_item) + 1),
		);
		return { was_read: true, why_not: null, the_answer: what_it_serves };
	};
}

/** A page of items, `how_many` of them, numbered from zero. */
const a_page_of = (how_many, from = 0) => Array.from({ length: how_many }, (_, an_index) => from + an_index);

describe("a tracker holding more items than one page can carry", () => {
	it("reads the second page as well as the first", async () => {
		const [what_it_said] = await what_the_trackers_say(
			[a_project],
			a_reader_serving({ "issues:1": [], "pulls:1": a_page_of(100), "pulls:2": a_page_of(3, 100) }),
		);

		assert.equal(
			what_it_said.the_pull_requests.length,
			103,
			"a hundred pull requests came back on the first page and the collector stopped there. " +
				"A hundred is the size of the envelope, not the number of pull requests.",
		);
	});

	it("reads a third page when the second is full too", async () => {
		const [what_it_said] = await what_the_trackers_say(
			[a_project],
			a_reader_serving({
				"issues:1": [],
				"pulls:1": a_page_of(100),
				"pulls:2": a_page_of(100, 100),
				"pulls:3": a_page_of(1, 200),
			}),
		);

		assert.equal(what_it_said.the_pull_requests.length, 201, "it stopped on the second full page");
	});

	it("stops on an empty page rather than asking forever", async () => {
		const the_log = [];
		await what_the_trackers_say(
			[a_project],
			a_reader_serving({ "issues:1": [], "pulls:1": a_page_of(100), "pulls:2": [] }, the_log),
		);

		/**
		 * **`[?&]page=` and not `page=`.** The first version of this line read the first match of
		 * `/page=(\d+)/`, which in `…&per_page=100&page=2` is the *page size*, so the log said every
		 * request was for page one hundred and this test failed against a collector that had walked
		 * two pages correctly. A rule too loose to tell `page=2` from `per_page=100` is a rule that
		 * reports the wrong thing confidently, which is worse than not looking.
		 */
		const the_pages_asked_for = the_log
			.filter((a_path) => a_path.includes("/pulls"))
			.map((a_path) => a_path.match(/[?&]page=(\d+)/)[1]);
		assert.deepEqual(
			the_pages_asked_for,
			["1", "2"],
			"the collector asked for pages beyond the empty one, which is a request per page forever " +
				"for a tracker with nothing on it",
		);
	});

	it("counts a repository holding exactly a hundred as holding a hundred, because page two was empty", async () => {
		const [what_it_said] = await what_the_trackers_say(
			[a_project],
			a_reader_serving({ "issues:1": [], "pulls:1": a_page_of(100), "pulls:2": [] }),
		);

		assert.equal(
			what_it_said.the_pull_requests.length,
			100,
			"a hundred is a real count now — it is only a symptom when there is no second page to " +
				"prove it is one",
		);
	});

	it("reads issues across pages as well, since the endpoint hides pull requests among them", async () => {
		const [what_it_said] = await what_the_trackers_say(
			[a_project],
			a_reader_serving({ "issues:1": a_page_of(100), "issues:2": a_page_of(2, 100), "pulls:1": [] }),
		);

		assert.equal(what_it_said.the_issues.length, 102, "issues were truncated where pull requests were not");
	});
});