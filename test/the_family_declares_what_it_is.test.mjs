/** The family declares two kinds of repository, and every one of them belongs to the other.
 *
 * **A copy is the subject of this page; an original is where the subject came from.** A copy is a
 * repository the system briefs itself against, and its tracker is where a run's work lands. An
 * original is the repository a copy was made from, and its tracker holds the human work of building
 * the system — 393 merged pull requests at the time of writing, against the copies' 25.
 *
 * **Which is why the two cannot be one list summed together.** The page says how many merged pull
 * requests are deliveries. Fold the originals in and it says 418, of which 393 are people writing
 * the system — a number that would look like the workflow's output and be almost entirely a
 * person's work. The declaration therefore names the kind on every entry, so the place that counts
 * has something to count and something to refuse.
 *
 * **Two invariants hold the declaration together, and both have bitten before.**
 *
 * 1. **Every original is the `a_copy_of` of some copy.** An original nobody was copied from is on
 *    the page for no reason, and the originals section would be a list with no argument for being
 *    a list.
 * 2. **Every copy's `a_copy_of` names an original that is on the page.** All six copies named
 *    repositories the page had never mentioned, which is why "a copy of X" was a phrase pointing
 *    off the page. Now the thing a copy points at is in the same table.
 *
 * A copy with no `a_copy_of` is refused, and so is an original with one.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { THE_FAMILY_THAT_BRIEFS_ITSELF, what_the_trackers_say } from "../scripts/ask_the_trackers.mjs";

/** The two kinds, spelled as the page and the state spell them. */
const A_COPY = "a copy the system briefs itself against";
const AN_ORIGINAL = "the original a copy was made from";

const the_copies = THE_FAMILY_THAT_BRIEFS_ITSELF.filter((a) => a.what_it_is === A_COPY);
const the_originals = THE_FAMILY_THAT_BRIEFS_ITSELF.filter((a) => a.what_it_is === AN_ORIGINAL);

describe("the family this page is about", () => {
	it("names what every one of its repositories is, and no repository is unsaid-for", () => {
		assert.deepEqual(
			THE_FAMILY_THAT_BRIEFS_ITSELF.filter(
				(a) => a.what_it_is !== A_COPY && a.what_it_is !== AN_ORIGINAL,
			),
			[],
			"a repository in the family does not say whether it is a copy or an original, so nothing " +
				"downstream can tell which of the two it is counting",
		);
	});

	it("has an original for every copy, and a copy for every original", () => {
		/**
		 * **Both groups, or the test below is vacuous.** Written without these two lines every
		 * assertion in this test filters an empty array, compares it with an empty array, and passes
		 * — which is what happened the first time this file ran: one red test and three green ones
		 * over a family that had not been told what anything was.
		 */
		assert.ok(the_copies.length > 0, "the family declares no copies at all");
		assert.ok(the_originals.length > 0, "the family declares no originals at all");

		const what_the_originals_are_named = new Set(the_originals.map((an) => an.name));

		const copies_naming_nothing = the_copies.filter((a_copy) => a_copy.a_copy_of === undefined);
		assert.deepEqual(
			copies_naming_nothing.map((a_copy) => a_copy.name),
			[],
			"a copy names no original. The page prints \"a copy of …\" and would be pointing at nothing.",
		);

		const copies_naming_a_missing_original = the_copies.filter(
			(a_copy) => !what_the_originals_are_named.has(a_copy.a_copy_of),
		);
		assert.deepEqual(
			copies_naming_a_missing_original.map((a_copy) => `${a_copy.name} → ${a_copy.a_copy_of}`),
			[],
			"a copy names an original that is not on the page. Every one of the first six did, which " +
				"is why this page pointed at six repositories it never showed.",
		);

		const originals_nothing_was_copied_from = the_originals.filter(
			(an_original) => !the_copies.some((a_copy) => a_copy.a_copy_of === an_original.name),
		);
		assert.deepEqual(
			originals_nothing_was_copied_from.map((an_original) => an_original.name),
			[],
			"an original is on the page and nothing was copied from it",
		);
	});

	it("carries no pull request count, because a declaration is not a reading", () => {
		const what_was_hand_written = THE_FAMILY_THAT_BRIEFS_ITSELF.filter(
			(a_project) => a_project.the_loop !== undefined || a_project.the_issues !== undefined,
		);
		assert.deepEqual(
			what_was_hand_written.map((a_project) => a_project.name),
			[],
			"a number was written into the list of repositories. Everything else about a repository " +
				"is read from GitHub, and a hand-written count in this list is the one place a reader " +
				"cannot check it.",
		);
	});
});

describe("a repository that could not be read", () => {
	it("keeps what it is, so an unread original is still an original", async () => {
		const [what_it_said] = await what_the_trackers_say(
			[{ owner: "steamnoid", name: "an-unreadable-original", what_it_is: AN_ORIGINAL }],
			async () => ({ was_read: false, why_not: "answered 403", the_answer: null }),
		);

		assert.equal(what_it_said.what_it_is, AN_ORIGINAL, "a refusal dropped the kind, so an unread original would be counted as a copy");
	});
});