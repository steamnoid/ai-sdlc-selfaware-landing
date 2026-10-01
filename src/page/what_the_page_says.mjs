/** What the page may print, and the rule each line of it comes from.
 *
 * **This page is about a tracker, so every number it prints is a number about somebody's work.**
 * That makes the rules narrower than in the page it is modelled on, and the difference is worth
 * stating: this one is not allowed to say whose work anything is unless a file says so.
 *
 * The findings that make it narrow, all derived from the trackers rather than typed here, and all
 * of them about the **copies** — the repositories the system briefs itself against:
 *
 * | what was looked for | what the copies hold |
 * |---|---|
 * | a pull request on a delivery branch (`aisdlc/issue-<n>-<run id>`) | none — every merged pull request is named after what it changed |
 * | more than one author | none — one account wrote every item on every copy's tracker |
 * | a filing's shape (a heading and named sections) | five items, in one copy |
 *
 * So a page headed "what the workflow delivered" would be claiming every merged pull request on
 * those trackers is a delivery, and **there is nothing in them that would let a reader tell that
 * claim from a hand-written commit.** The rules below therefore print the counts and refuse the
 * authorship.
 *
 * **The originals are not part of any of it, and the rule is inside the counting rather than in the
 * caller.** Each copy was made from an original, and an original's tracker holds the human work of
 * building the system — hundreds of merged pull requests, none on a delivery branch. A sum that
 * walked both lists would turn that into deliveries, so `what_the_attribution_says` counts copies
 * and cannot be made to count anything else.
 */

import {
	A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST,
	THE_ORIGINAL_A_COPY_WAS_MADE_FROM,
	carries_the_filing_format,
	is_a_delivery_branch,
} from "../../scripts/ask_the_trackers.mjs";

export class TheStateIsNotReadableError extends Error {
	constructor(why) {
		super(why);
		this.name = "TheStateIsNotReadableError";
	}
}

/**
 * Every item on every tracker, and what can be told about it.
 *
 * **Two things are counted here and neither is a number somebody typed**: how many items carry
 * the filing agent's shape, and how many pull requests sit on a branch a delivery would use.
 * Everything else is the count of what GitHub returned.
 */
export function every_item_of(a_project) {
	return [...a_project.the_issues, ...a_project.the_pull_requests];
}

/**
 * Whether an item can be attributed to the workflow, and what the evidence is.
 *
 * **Three signals, and two of them are absent across the whole family**, so this function answers
 * `cannot be told` for almost everything. That is the finding, and it is reported rather than
 * worked around.
 *
 * | the evidence | what it would mean |
 * |---|---|
 * | the branch is a delivery branch | a run made this pull request, and the issue it is named after asked for it |
 * | the body carries the filing shape | this was written by the filing agent — or by somebody who copied its shape, which no reader can tell apart |
 * | neither | nothing on the tracker says who wrote this |
 */
export function what_can_be_told_about(a_item) {
	if (a_item.on_a_delivery_branch === true) {
		return {
			verdict: "delivered by a run",
			why: `the branch is ${a_item.branch}, which is the convention a delivery is made on`,
		};
	}
	if (a_item.carries_the_filing_format === true) {
		return {
			verdict: "carries the shape a filing is written in",
			why: "the body has a heading and the sections a filing carries, and a person who copied that " +
				"shape would be counted here too",
		};
	}
	return {
		verdict: "cannot be told from the tracker",
		why: a_item.branch === undefined
			? "nothing about the body of an issue says who wrote it, and a hand-written one and a filed one can look the same"
			: `the branch is named ${a_item.branch}, which is what a person pushing a branch calls it, and ` +
				"the body carries no filing shape",
	};
}

/**
 * The family-wide findings the page leads with, counted over every item on every tracker.
 *
 * **Every number here is a count of what GitHub returned.** The third is the one that decides the
 * rest of the page, and it is worth being exact about what it does and does not say: no pull
 * request on any of the six was made from a branch a delivery uses. That means none of them can be
 * *shown* to be a run's delivery. It does not say they were not — it says the tracker does not
 * record it, which is what this page is allowed to report.
 */
export function what_the_attribution_says(the_projects) {
	/**
	 * **The copies, and only the copies — decided here rather than by whoever calls.**
	 *
	 * This is the sum the whole page's argument rests on, and the page holds fourteen repositories:
	 * seven copies whose trackers are where a run's work lands, and the seven originals they were
	 * made from, whose trackers hold the human work of building the system. Both lists arrive here
	 * whenever the caller walks the family, and the originals carry hundreds of merged pull requests
	 * that are not on a delivery branch and were never deliveries.
	 *
	 * Filtering inside the function rather than at the call site is the whole point. A caller that
	 * forgets hands this every repository and the page says "418 deliveries"; a caller that cannot
	 * forget cannot get it wrong, however the family grows.
	 */
	const the_copies = the_projects.filter(
		(a_project) => a_project.what_it_is === A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST,
	);
	const every_item = the_copies.flatMap(every_item_of);
	const the_pull_requests = the_copies.flatMap((a_project) => a_project.the_pull_requests);
	const the_merged = the_pull_requests.filter((a_pull) => a_pull.was_merged !== null);

	return {
		how_many_projects_were_read: the_copies.filter((a_project) => a_project.was_read === true).length,
		how_many_projects_were_asked_about: the_copies.length,
		how_many_items: every_item.length,
		how_many_were_merged: the_merged.length,
		how_many_were_delivered_by_a_run: the_merged.filter((a_pull) => is_a_delivery_branch(a_pull.branch)).length,
		// **The flag the collector already set on each item, and not a second reading of it.** The
		// first version counted filing shapes out of the item *titles* and then added the issues'
		// own count on top, which is two different questions added together.
		how_many_carry_the_filings_shape: every_item.filter((an_item) => an_item.carries_the_filing_format === true).length,
		how_many_people_wrote_anything: new Set(
			every_item.map((an_item) => an_item.was_written_by_somebody).filter((a_name) => a_name !== null),
		).size,
		how_many_hold_a_tracker_at_all: the_copies.filter(
			(a_project) => a_project.was_read === true && every_item_of(a_project).length > 0,
		).length,
	};
}

/**
 * What the originals' own trackers hold, counted apart from anything the workflow produced.
 *
 * **These are people's pull requests, and the only thing on this page that says so is this
 * section's heading.** The originals are where the system was built, so their trackers are full of
 * merged pull requests and none of them is on a branch a delivery uses. Printing nothing would hide
 * hundreds of real changes; printing them next to the copies' counts would invite the reading that
 * they are deliveries. So they are counted here, separately, and never added to the attribution
 * above — a sum that reached both lists would say 418 deliveries instead of 25.
 */
export function what_the_originals_hold(the_originals) {
	const the_read = the_originals.filter((a_project) => a_project.was_read === true);
	const the_pull_requests = the_read.flatMap((a_project) => a_project.the_pull_requests);

	return {
		how_many_originals: the_originals.length,
		how_many_were_read: the_read.length,
		how_many_issues: the_read.reduce((a_total, a_project) => a_total + a_project.the_issues.length, 0),
		/**
		 * **How many of them are still open, which is not the same question.**
		 *
		 * The section holding the originals counted merged pull requests and deliveries and never
		 * mentioned an issue at all, so a reader who reached the bottom of this page could not say
		 * whether any repository the system was built in had work outstanding. A total of issues on
		 * its own does not answer that: a repository with one closed issue and a repository with one
		 * open issue print the same cell.
		 */
		how_many_issues_are_open: the_read.reduce(
			(a_total, a_project) => a_total + a_project.the_issues.filter((an_issue) => an_issue.state === "open").length,
			0,
		),
		how_many_pull_requests: the_pull_requests.length,
		how_many_were_merged: the_pull_requests.filter((a_pull) => a_pull.was_merged !== null).length,
		how_many_were_delivered_by_a_run: the_pull_requests.filter((a_pull) => is_a_delivery_branch(a_pull.branch)).length,
		how_many_hold_a_tracker_at_all: the_read.filter(
			(a_project) => every_item_of(a_project).length > 0,
		).length,
	};
}

/**
 * One project as the page may print it.
 *
 * **The description is quoted and never summarised.** Every one of the six states in its own
 * description that the system works on it, and that is the only statement on this page about who
 * writes there — attributed to the repository that makes it rather than asserted here.
 */
function what_one_project_says(a_project, the_copies_made_from_it) {
	const the_open_issues = a_project.the_issues.filter((an_issue) => an_issue.state === "open");
	const the_merged = a_project.the_pull_requests.filter((a_pull) => a_pull.was_merged !== null);
	const the_unmerged = a_project.the_pull_requests.filter((a_pull) => a_pull.was_merged === null);
	return {
		name: a_project.name,
		owner: a_project.owner,
		url: a_project.url,
		what_it_is: a_project.what_it_is ?? null,
		was_written_from:
			a_project.what_it_is === THE_ORIGINAL_A_COPY_WAS_MADE_FROM
				? the_copies_made_from_it ?? null
				: null,
		a_copy_of: a_project.a_copy_of ?? null,
		/**
		 * **An absent description gets a sentence, and never an invented one.**
		 *
		 * `ai-sdlc-os` has no description on GitHub at all. Printing an empty cell would leave a
		 * reader unable to tell whether the description was empty, could not be read, or was never
		 * asked for — three different facts, and the table looks the same for all of them.
		 */
		why_it_has_no_description:
			a_project.was_read === true && (a_project.what_it_says_it_is ?? null) === null
				? "this repository has no description on GitHub"
				: null,
		was_read: a_project.was_read === true,
		why_not: a_project.was_read === true ? null : a_project.why_not,
		what_it_says_it_is: a_project.what_it_says_it_is ?? null,
		was_created_on: a_project.was_created_on ?? null,
		/**
		 * **Counted from the items this projection is about, and not carried from the reading.**
		 *
		 * The collector computes a `the_loop` and the projection kept it, so the page printed counts
		 * from one object and the items underneath them from another. When they disagree the page shows
		 * a number, and rows beneath it that add up to something else — which is the exact failure
		 * this repository found once already, in a different module, by reading it wrong.
		 *
		 * Counting here means the two cannot disagree: there is one set of items and one set of
		 * counts, derived from the same list.
		 */
		the_loop: {
			how_many_issues: a_project.the_issues.length,
			how_many_issues_are_open: the_open_issues.length,
			how_many_carry_the_filings_shape: a_project.the_issues.filter(
				(an_issue) => an_issue.carries_the_filing_format === true,
			).length,
			how_many_pull_requests: a_project.the_pull_requests.length,
			how_many_were_merged: the_merged.length,
			how_many_were_delivered_by_a_run: a_project.the_pull_requests.filter(
				(a_pull) => a_pull.on_a_delivery_branch === true,
			).length,
		},
		open_issues: the_open_issues,
		closed_issues: a_project.the_issues.filter((an_issue) => an_issue.state !== "open"),
		unmerged_pull_requests: the_unmerged,
		merged_pull_requests: the_merged,
	};
}

/**
 * The whole state as the page may print it, or a refusal naming what it could not read.
 *
 * **A state that was not read is refused by name rather than answered with nothing.** A page
 * about six repositories that printed three would be telling a reader the family has three
 * members, which is the one thing this family of pages states it never does.
 */
export function what_the_page_says(the_state) {
	if (the_state === null || the_state === undefined) {
		throw new TheStateIsNotReadableError("there is no state at src/state/the_family.json");
	}
	if (!Array.isArray(the_state.the_family)) {
		return {
			verdict: "nothing to say",
			the_heading: "No state, so nothing to say",
			the_projects: [],
			the_attribution: what_the_attribution_says([]),
			when_was_it_read: the_state.the_build?.read_at ?? null,
			why_not:
				"the state is there but its the_family is not a list, so nothing can be read out of " +
				"it. Run `npm run collect` to read the trackers and write one this page can read.",
		};
	}
if (the_state.the_family.length === 0) {
		/**
		 * **A reading that found nothing, which is not a missing reading — and not a stand-in either.**
		 *
		 * This branch used to be the one above, and every sentence in it was false here: the file is
		 * on disk, and this is not the fresh-clone render. What *is* true is the one interesting
		 * fact — the trackers were read, they answered, and every one of them held nothing — and the
		 * reading's own timestamp is kept, because "read at" is the only evidence that the read
		 * happened rather than that somebody meant to.
		 *
		 * **Which is why the timestamp is what this branch keys on.** A stand-in for a missing state
		 * is `{"the_family": []}` and nothing else, so it lands here too and would claim the
		 * trackers answered when nobody asked them. A reading is only a reading if it says when it
		 * happened.
		 */
		const when_was_it_read = the_state.the_build?.read_at ?? null;
		if (when_was_it_read === null) {
			return {
				verdict: "nothing to say",
				the_heading: "No state, so nothing to say",
				the_projects: [],
				the_attribution: what_the_attribution_says([]),
				when_was_it_read: null,
				why_not:
					"no state at src/state/the_family.json, so no tracker was read. The state is a build " +
					"artefact and is never committed, so this is what a fresh clone has. Run " +
					"`npm run collect` to read the trackers and build the page from them.",
			};
		}
		return {
			verdict: "read nothing",
			the_heading: "The trackers were read, and every one of them held nothing",
			the_projects: [],
			the_attribution: what_the_attribution_says([]),
			when_was_it_read,
			why_not:
				"the trackers were read and every one of them held nothing. That is a fact about the " +
				"trackers and not an absence of one: a repository answers with an empty list when it " +
				"has no issues and no pull requests, and a page that renders that as nothing to " +
				"say is reporting its own emptiness as theirs. Run `npm run collect` to read them again.",
		};
	}

	/**
	 * **Which copies were made from each original**, resolved from the family's own declarations.
	 *
	 * An original is on the page because something was copied from it, so the page says what. The
	 * names come from the copies' `a_copy_of` fields and not from a second list written by hand,
	 * which is what `test/the_family_declares_what_it_is.test.mjs` holds true: an original nothing
	 * was copied from is refused at the declaration.
	 */
	const the_copies_declared = the_state.the_family.filter(
		(a_project) => a_project.what_it_is === A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST,
	);
	const the_originals_declared = the_state.the_family.filter(
		(a_project) => a_project.what_it_is === THE_ORIGINAL_A_COPY_WAS_MADE_FROM,
	);
	const what_was_copied_from = (an_original) =>
		the_copies_declared
			.filter((a_copy) => a_copy.a_copy_of === an_original.name)
			.map((a_copy) => a_copy.name);

	return {
		verdict: "read",
		the_heading: null,
		the_copies: the_copies_declared.map((a_copy) => what_one_project_says(a_copy, [])),
		the_originals: the_originals_declared.map((an_original) =>
			what_one_project_says(an_original, what_was_copied_from(an_original)),
		),
		how_many_repositories_were_read: the_state.the_family.filter((a) => a.was_read === true).length,
		how_many_repositories_were_asked_about: the_state.the_family.length,
		the_attribution: what_the_attribution_says(the_state.the_family),
		what_the_originals_hold: what_the_originals_hold(the_originals_declared),
		when_was_it_read: the_state.the_build?.read_at ?? null,
		why_not: null,
	};
}

/** How many of the projects could not be read at all, and the reasons, which is a finding. */
export function those_that_could_not_be_read(the_projects) {
	return the_projects.filter((a_project) => a_project.was_read !== true);
}

export { carries_the_filing_format, is_a_delivery_branch };