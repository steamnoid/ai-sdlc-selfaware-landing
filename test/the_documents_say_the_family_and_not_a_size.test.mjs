/** The documents say "the family", and never a size the page counts.
 *
 * **This is a list of known claims and not a detector, and that is deliberate.**
 *
 * A document cannot count: it is not built, so a number in it is a number nobody counted. That is the
 * rule the page follows, applied to prose that has no counter — but a general detector for "a number
 * about the family" would have to be loose, and a rule that cannot be told apart from ordinary
 * writing is a rule a writer learns to work around. This one names the exact sentences it holds true,
 * and its failure message says which file and which phrase, so the next one to rot is added here.
 *
 * **What it deliberately does not catch.** These documents record measurements, and a measurement is
 * a fact about a moment: "the first six held 25 merged pull requests", "393 merged". Those are
 * allowed, because they are dated by the sentence around them. What is refused is a claim about how
 * many repositories the family has *now*, which is the page's number and this page's alone.
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const at = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The phrases that are a count of the family, and the file each was found in last. */
const THE_CLAIMS_THAT_ROT = [
	{ the_document: "README.md", the_phrase: /six repositories/i, says: "how many repositories are on the page" },
	{ the_document: "README.md", the_phrase: /six repositories rather than one/i, says: "how many repositories the page serves" },
	{ the_document: "README.md", the_phrase: /these six trackers/i, says: "which trackers the page read" },
	{ the_document: "README.md", the_phrase: /the six trackers/i, says: "which trackers the collector reads" },
	{ the_document: "AGENTS.md", the_phrase: /these six trackers/i, says: "which trackers the page read" },
	{ the_document: "AGENTS.md", the_phrase: /the six trackers/i, says: "which trackers the collector reads" },
	{ the_document: "AGENTS.md", the_phrase: /six `owner\/name` pairs/i, says: "how many repositories are declared" },
	{ the_document: "AGENTS.md", the_phrase: /six of six/i, says: "how many descriptions make a claim" },
	{ the_document: "AGENTS.md", the_phrase: /six of the copies/i, says: "how many copies say something" },
	{ the_document: "AGENTS.md", the_phrase: /about six repositories/i, says: "how many repositories the page is about" },
];

describe("the documents of this repository", () => {
	for (const a_document of ["README.md", "AGENTS.md"]) {
		it(`${a_document} holds no count of the family`, () => {
			const what_it_says = readFileSync(join(at, a_document), "utf8");
			const what_it_gets_wrong = THE_CLAIMS_THAT_ROT.filter((a_claim) => a_claim.the_document === a_document)
				.map((a_claim) => ({ ...a_claim, where: a_claim.the_phrase.exec(what_it_says)?.[0] }))
				.filter((a_claim) => a_where_is_true(a_claim));

			assert.deepEqual(
				what_it_gets_wrong.map((a_claim) => `"${a_claim.where}" — ${a_claim.says}`),
				[],
				`${a_document} states ${what_it_gets_wrong.length} count${what_it_gets_wrong.length === 1 ? "" : "s"} of the ` +
					"family in words. The page counts them and no document does, so a sentence here is true " +
					"until a repository is added and then quietly false. Say \"the family\" or \"these\" instead.",
			);
		});
	}

	it("still describes what the family holds, so the rule was not met by deleting the subject", () => {
		const what_it_says = readFileSync(join(at, "AGENTS.md"), "utf8");
		assert.match(
			what_it_says,
			/the family/,
			"the rule about numbers is not a reason to stop talking about the repositories",
		);
	});
});

const a_where_is_true = (a_claim) => a_claim.where !== undefined;