/** The two kinds of repository are counted apart, and never added together.
 *
 * **This is the test for the number 418.**
 *
 * The page says how many merged pull requests are deliveries. Its copies' trackers hold 25 of them.
 * Their originals' trackers hold 393 more — the human work of building the system — and the page
 * sums over whatever list it is handed. So the first version of this test built the page from six
 * copies, and the second from those six copies plus their originals, and compared every workflow
 * number. If adding originals moves any of them, this repository is claiming somebody's pull request
 * as a delivery.
 *
 * **The originals are not hidden, and that is the other half of it.** Suppressing 393 real pull
 * requests would be its own kind of lie — a page whose rule is "a fact is generated, or it is not on
 * the page", applied to facts it does not like. They are counted, printed, and labelled as the
 * projects' own development.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
	what_the_attribution_says,
	what_the_page_says,
} from "../src/page/what_the_page_says.mjs";

const A_COPY = "a copy the system briefs itself against";
const AN_ORIGINAL = "the original a copy was made from";

/** One repository as the reading holds it. */
const a_repository = (over = {}) => ({
	owner: "steamnoid",
	name: "a_repository",
	url: "https://github.com/steamnoid/a_repository",
	was_read: true,
	why_not: null,
	what_it_says_it_is: "The copy this system works on: its own codebase.",
	was_created_on: "2026-10-01T00:00:00Z",
	the_issues: [
		{
			number: 1,
			title: "an opportunity",
			state: "open",
			created_at: "2026-10-01",
			closed_at: null,
			carries_the_filing_format: true,
			labels: [],
			was_written_by_somebody: "somebody",
		},
	],
	the_pull_requests: [
		{
			number: 2,
			title: "a change",
			branch: "docs/a-thing",
			state: "closed",
			was_merged: "2026-10-02",
			created_at: "2026-10-01",
			on_a_delivery_branch: false,
			labels: [],
			was_written_by_somebody: "somebody",
		},
	],
	...over,
});

/** A repository the system did not deliver into: many pull requests, none of them on a delivery branch. */
const an_original_with_a_years_work = (over = {}) =>
	a_repository({
		name: "an_original",
		what_it_is: AN_ORIGINAL,
		the_issues: [],
		the_pull_requests: Array.from({ length: 40 }, (_, an_index) => ({
			number: 100 + an_index,
			title: `a change somebody pushed by hand, number ${an_index}`,
			branch: `docs/something-${an_index}`,
			state: "closed",
			was_merged: "2026-01-01",
			created_at: "2025-06-01",
			on_a_delivery_branch: false,
			labels: [],
			was_written_by_somebody: "somebody",
		})),
		...over,
	});

const THE_COPIES = [a_repository({ what_it_is: A_COPY, a_copy_of: "an_original" })];
const THE_ORIGINALS = [an_original_with_a_years_work()];

describe("the attribution of what the workflow produced", () => {
	it("counts the copies and nothing else, even when handed both kinds", () => {
		const copies_only = what_the_attribution_says(THE_COPIES);
		const both_kinds = what_the_attribution_says([...THE_COPIES, ...THE_ORIGINALS]);

		assert.deepEqual(
			both_kinds,
			copies_only,
			"the attribution moved when an original was added. Forty pull requests of somebody else's " +
				"work would be counted as forty things the system delivered.",
		);
	});

	it("counts one issue and one pull request, from one copy", () => {
		const what_it_says = what_the_attribution_says(THE_COPIES);

		assert.equal(what_it_says.how_many_items, 2);
		assert.equal(what_it_says.how_many_were_merged, 1);
		assert.equal(what_it_says.how_many_were_delivered_by_a_run, 0);
	});
});

describe("a page holding a copy and the original it was made from", () => {
	const what_it_says = what_the_page_says({
		the_build: { read_at: "2026-10-01T09:00:00.000Z" },
		the_family: [...THE_COPIES, ...THE_ORIGINALS],
	});

	it("says which is which, and counts each in its own place", () => {
		assert.equal(what_it_says.the_copies.length, 1, "the copy was not kept as a copy");
		assert.equal(what_it_says.the_originals.length, 1, "the original was not kept as an original");
		assert.equal(
			what_it_says.the_copies.length + what_it_says.the_originals.length,
			2,
			"a repository was dropped or counted twice on the way through",
		);
	});

	it("counts the originals' own work apart, and says none of it was delivered by a run", () => {
		assert.equal(
			what_it_says.what_the_originals_hold.how_many_pull_requests,
			40,
			"the originals' pull requests are not counted at all, so the section would show an empty table " +
				"under a heading about repositories that are nothing but pull requests",
		);
		assert.equal(what_it_says.what_the_originals_hold.how_many_were_merged, 40);
		assert.equal(
			what_it_says.what_the_originals_hold.how_many_were_delivered_by_a_run,
			0,
			"an original is reported as holding deliveries. None of them is on a delivery branch, which " +
				"is the only evidence on this page that a run made them.",
		);
	});

	it("does not put the originals' numbers anywhere in the attribution", () => {
		const every_number_the_attribution_holds = Object.values(what_it_says.the_attribution);

		assert.ok(
			!every_number_the_attribution_holds.includes(41),
			"the attribution counts 41 pull requests, which is the copy's one and the original's forty",
		);
	});
});

describe("an original whose repository has no description", () => {
	const what_it_says = what_the_page_says({
		the_build: { read_at: "2026-10-01T09:00:00.000Z" },
		the_family: [a_repository({ what_it_is: A_COPY, a_copy_of: "an_original" }), a_repository({ name: "an_original", what_it_is: AN_ORIGINAL, what_it_says_it_is: null })],
	});

	it("says it has no description, and does not print an empty cell", () => {
		assert.equal(
			what_it_says.the_originals[0].what_it_says_it_is,
			null,
			"a missing description was replaced with a sentence, which would put a sentence on the " +
				"page that GitHub does not hold",
		);
		assert.equal(
			what_it_says.the_originals[0].why_it_has_no_description,
			"this repository has no description on GitHub",
			"there is no sentence explaining the empty cell, so a reader cannot tell whether the " +
				"description was empty, unread, or never asked for",
		);
	});
});