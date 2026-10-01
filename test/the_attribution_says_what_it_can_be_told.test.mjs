/** What the family-wide counts are, and what the page may say about authorship.
 *
 * **This file exists because the answer is uncomfortable.** On these six trackers nothing records
 * who wrote what: no pull request sits on a branch a delivery uses, one account is the author of
 * everything, and only one repository's filings carry the shape the filing agent writes. A page
 * about "what the workflow delivered" would therefore be claiming fifteen merged pull requests are
 * deliveries, and this is the file that says it may not.
 *
 * **Every count here is a count of what the fixtures hold**, so a project that starts filing
 * deliveries moves the number without this file being edited.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { what_can_be_told_about, what_the_attribution_says, what_the_page_says } from "../src/page/what_the_page_says.mjs";

/** One project as the reading holds it, with the items the test is about. */
const a_project = (the_issues = [], the_pull_requests = []) => ({
	owner: "steamnoid",
	name: "a_project",
	url: "https://github.com/steamnoid/a_project",
	what_it_is: "a copy the system briefs itself against",
	a_copy_of: "the-project-it-copies",
	was_read: true,
	why_not: null,
	what_it_says_it_is: "The copy this system works on.",
	was_created_on: "2026-10-01T00:00:00Z",
	the_issues,
	the_pull_requests,
	the_loop: null,
});

const an_issue = (over = {}) => ({
	number: 1,
	title: "a thing worth doing",
	state: "open",
	created_at: "2026-10-01",
	closed_at: null,
	carries_the_filing_format: false,
	labels: [],
	was_written_by_somebody: "somebody",
	...over,
});

const a_pull_request = (over = {}) => ({
	number: 2,
	title: "a change",
	branch: "docs/what-a-run-has-to-be-told",
	state: "closed",
	was_merged: "2026-10-02",
	created_at: "2026-10-01",
	on_a_delivery_branch: false,
	labels: [],
	was_written_by_somebody: "somebody",
	...over,
});

describe("what can be told about one item, and what cannot", () => {
	it("calls a pull request on a delivery branch the work of a run", () => {
		const what_it_says = what_can_be_told_about(
			a_pull_request({ branch: "aisdlc/issue-7-4f2a9c", on_a_delivery_branch: true }),
		);

		assert.equal(what_it_says.verdict, "delivered by a run", "a delivery branch was not recognised as one");
	});

	it("calls a filing's shape a shape and never a fact about who wrote it", () => {
		const what_it_says = what_can_be_told_about(an_issue({ carries_the_filing_format: true }));

		assert.equal(what_it_says.verdict, "carries the shape a filing is written in");
		assert.match(
			what_it_says.why,
			/copied that shape|would be counted/i,
			"the reason does not say what the shape cannot establish. A shape is evidence and not a " +
				"record, and this is the only place the page says so about an individual item.",
		);
	});

	it("calls a hand-named pull request something it cannot tell, which is the whole point", () => {
		const what_it_says = what_can_be_told_about(a_pull_request());

		assert.equal(
			what_it_says.verdict,
			"cannot be told from the tracker",
			"a pull request on a branch named after what it changed was attributed to the workflow. This " +
				"is the error the page exists to avoid, and there is nothing in these trackers that would " +
				"let a reader catch it.",
		);
		assert.match(what_it_says.why, /nobody pushing a branch calls it|what a person pushing/i);
	});
});

describe("the family-wide counts, over a family that has nothing in it", () => {
	it("counts zero rather than one project, when nothing was read", () => {
		const the_counts = what_the_attribution_says([
			a_project(), { ...a_project(), name: "unreadable", was_read: false, the_issues: [], the_pull_requests: [] },
		]);

		assert.equal(the_counts.how_many_projects_were_read, 1);
		assert.equal(the_counts.how_many_projects_were_asked_about, 2);
		assert.equal(the_counts.how_many_items, 0);
	});

	it("counts only the merged pull requests as merged", () => {
		const the_counts = what_the_attribution_says([
			a_project([], [
				a_pull_request({ number: 1, was_merged: "2026-10-02" }),
				a_pull_request({ number: 2, was_merged: null }),
				a_pull_request({ number: 3, was_merged: "2026-10-03" }),
			]),
		]);

		assert.equal(the_counts.how_many_were_merged, 2, "an open pull request is counted as a delivery");
		assert.equal(the_counts.how_many_were_delivered_by_a_run, 0);
	});

	it("counts the people who wrote anything across the whole family, not per project", () => {
		const the_counts = what_the_attribution_says([
			a_project([an_issue({ was_written_by_somebody: "someone" })], []),
			a_project([an_issue({ was_written_by_somebody: "somebody-else" })], []),
		]);

		assert.equal(the_counts.how_many_people_wrote_anything, 2, "people are counted once for the family and not twice for the project");
	});

	it("counts a filing's shape once, from the item and not from a second reading of it", () => {
		// **The first version counted filing shapes out of the item titles and then added the
		// issues' own count on top**, which is two questions added together — and it reported five
		// on a family that holds two.
		const the_counts = what_the_attribution_says([
			a_project([an_issue({ carries_the_filing_format: true }), an_issue({ number: 2 })], []),
		]);

		assert.equal(
			the_counts.how_many_carry_the_filings_shape,
			1,
			"the count of items carrying the filing agent's shape does not match the items that carry it",
		);
	});
});

describe("a state that was not read, and a state that read nothing", () => {
	it("refuses a state that is not there by name", () => {
		assert.throws(
			() => what_the_page_says(null),
			/the_family\.json/,
			"a missing state is answered with an empty page rather than named, so a build failure and a " +
				"deliberate empty reading are the same thing.",
		);
	});

	it("answers a state holding no projects with the reason, and not with zeroes", () => {
		const the_page = what_the_page_says({ the_build: { read_at: "2026-10-01T00:00:00Z" }, the_family: [] });

		// **This test asserted the wrong thing for a week of its own existence.** It demanded that a
		// state which was read and held nothing report itself as `nothing to say` with "no state at"
		// in the reason — the file was on disk, and a page that says it is not is lying about the one
		// thing a reader can check for themselves.
		assert.equal(the_page.verdict, "read nothing");
		assert.doesNotMatch(the_page.why_not, /no state at/, "a state that was read and held nothing is reported as no state");
	});

	it("keeps a project that could not be read, with its reason", () => {
		const the_page = what_the_page_says({
			the_build: { read_at: "2026-10-01T00:00:00Z" },
			the_family: [
				a_project(),
				{ ...a_project(), name: "unreadable", was_read: false, why_not: "GitHub answered 403" },
			],
		});

		assert.equal(the_page.the_copies.length, 2, "a project that could not be read was dropped from the family");
		assert.match(the_page.the_copies[1].why_not, /403/);
	});
});