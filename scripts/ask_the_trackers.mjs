/** What six repositories' trackers hold, and what can and cannot be told about who wrote it.
 *
 * **The subject of this page is a tracker, not a codebase.** Nothing here clones anything and
 * nothing here runs a test suite, because nothing about "what did the workflow produce" is
 * answered by a working tree. That is also why it is the most reliable page in this family: a
 * `collect` that reads a sibling repository's files fails when somebody is halfway through an
 * edit in that repository, and one of those happened this afternoon.
 *
 * **The reader is a parameter, and not a `fetch` inside a function.** Every test in this
 * repository needs the trackers, and a test that reached for the network would be a test that
 * only runs sometimes. So the caller supplies the reader and the tests supply fixtures, which is
 * the same seam `ask_the_family.mjs` uses for the Python interpreter.
 *
 *     node scripts/ask_the_trackers.mjs                       # the six, from api.github.com
 *     node scripts/ask_the_trackers.mjs --out src/state/the_family.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * The six copies the system briefs itself against, and what each is a copy of.
 *
 * **The only hand-written thing on this page.** Everything else — how many issues, how many
 * deliveries, whether a filing is the workflow's shape — is read out of GitHub at build time,
 * so the list of where to look is here and nothing about what is there is.
 */
/**
 * The two kinds, spelled exactly as the page and the state spell them.
 *
 * **A copy is what this page is about; an original is where it came from.** A copy's tracker is
 * where a run's work lands. An original's tracker holds the human work of building the system —
 * 393 merged pull requests at the time of writing against the copies' 25 — so the two are never
 * added together anywhere, and the kind travels with the reading even when the reading is refused.
 */
export const A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST = "a copy the system briefs itself against";
export const THE_ORIGINAL_A_COPY_WAS_MADE_FROM = "the original a copy was made from";

/**
 * Fourteen repositories, in one list, each saying which kind it is.
 *
 * **One list and not two, because the place that counts is where this would go wrong.** The page
 * sums over whatever it is handed; the first version of this declaration was copies only, and
 * adding the originals to a second list that the same sum also walked is a mistake waiting to be
 * made. The kind on each entry is what stops it, and
 * `test/the_family_declares_what_it_is.test.mjs` holds two invariants that keep the list honest: every
 * original is some copy's `a_copy_of`, and every copy's `a_copy_of` is on the page.
 *
 * **The sixth copy and its seventh original were added together**, because `ai-sdlc-bestof-fast-alt`
 * is the repository `ai-sdlc-bestof-fast-selfaware-alt` was made from — the same shape as
 * `ai-sdlc-bestof-fast` and `ai-sdlc-bestof-fast-selfaware`. An original with nothing copied from
 * it would be a row with no argument for being a row.
 */
export const THE_FAMILY_THAT_BRIEFS_ITSELF = [
	{ owner: "steamnoid", name: "ai-sdlc-os-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-os" },
	{ owner: "steamnoid", name: "ai-sdlc-os-plus-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-os-plus" },
	{ owner: "steamnoid", name: "ai-sdlc-app-rs-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-app-rs" },
	{ owner: "steamnoid", name: "ai-sdlc-app-rs-plus-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-app-rs-plus" },
	{ owner: "steamnoid", name: "ai-sdlc-bestof-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-bestof" },
	{ owner: "steamnoid", name: "ai-sdlc-bestof-fast-selfaware", what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST, a_copy_of: "ai-sdlc-bestof-fast" },
	{
		owner: "steamnoid",
		name: "ai-sdlc-bestof-fast-selfaware-alt",
		what_it_is: A_COPY_THE_SYSTEM_BRIEFS_ITSELF_AGAINST,
		a_copy_of: "ai-sdlc-bestof-fast-alt",
	},

	{ owner: "steamnoid", name: "ai-sdlc-os", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-os-plus", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-app-rs", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-app-rs-plus", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-bestof", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-bestof-fast", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
	{ owner: "steamnoid", name: "ai-sdlc-bestof-fast-alt", what_it_is: THE_ORIGINAL_A_COPY_WAS_MADE_FROM },
];

/** How the workflow writes a filing: a heading, then named sections under it. */
export const THE_SECTIONS_A_FILING_CARRIES = [
	"Why it is worth doing",
	"How we would know it worked",
	"Which discipline owns it",
	"The risk",
	"The files that show this",
];

/**
 * Whether an issue's body carries the shape a filing carries.
 *
 * **The only attribution signal that exists in this family, and it is a shape rather than a
 * record.** `ai-sdlc-bestof-fast`'s five issues are written by the filing agent and every one
 * of them has a `##` heading and at least two of the sections above. `ai-sdlc-os-selfaware`'s
 * thirty-two are one line of prose each, with no heading and no marker — checked, 32 of 32 — so
 * the rule identifies one repository's filings and not another's.
 *
 * That is stated here rather than smoothed over: **a shape is evidence, not a record.** A person
 * who copied the shape would be counted as the system, and there is no way to tell those apart
 * from the text of an issue. So an item this function says is a filing is labelled as carrying
 * the filing's shape, and nothing more is claimed about it.
 */
export function carries_the_filing_format(a_body) {
	if (typeof a_body !== "string" || a_body.trim() === "") {
		return false;
	}
	if (!/^##\s+\S/m.test(a_body)) {
		return false;
	}
	return THE_SECTIONS_A_FILING_CARRIES.filter((a_section) => a_body.includes(a_section)).length >= 2;
}

/**
 * Whether a branch is one a delivery is made on.
 *
 * **`ai-sdlc-os` names its delivery branches `aisdlc/issue-<number>-<run id>`** and records that
 * convention in its own documentation. A pull request on such a branch was therefore delivered by
 * a run, and the issue it is named after is the filing that asked for it.
 *
 * **None of the merged pull requests on the six copies is on a branch like that.** They are
 * named after what they changed, which is what a person pushing a branch calls it. This is the
 * finding the page leads its attribution section with, and it is derived rather than typed: the
 * count is the count of branches that match.
 *
 * **The run id is six or more hexadecimal characters and not "any words", and the difference is
 * the whole of what this function is for.** The first version accepted any suffix, which read
 * `aisdlc/issue-12-someone-elses-work` as a delivery — and this is the one rule on this page that
 * could hand a delivery to a branch somebody pushed by hand. A rule that is too loose here is not a
 * rule that over-counts; it is a rule that lies about authorship, which is the thing the page
 * exists to decline to do.
 */
export function is_a_delivery_branch(a_branch) {
	return /^aisdlc\/issue-\d+(?:-[0-9a-f]{6,})?$/.test(String(a_branch ?? ""));
}

/** What one item on a tracker says about itself, and whether the workflow's shape is visible in it. */
function what_one_issue_says(a_issue) {
	return {
		number: a_issue.number,
		title: a_issue.title,
		state: a_issue.state,
		created_at: a_issue.created_at ?? null,
		closed_at: a_issue.closed_at ?? null,
		carries_the_filing_format: carries_the_filing_format(a_issue.body),
		labels: (a_issue.labels ?? []).map((a_label) => (typeof a_label === "string" ? a_label : a_label.name)),
		was_written_by_somebody: a_issue.user?.login ?? null,
	};
}

/** What one pull request says about itself, and whether it was made by a run. */
function what_one_pull_request_says(a_pull) {
	const the_branch = a_pull.head?.ref ?? null;
	return {
		number: a_pull.number,
		title: a_pull.title,
		branch: the_branch,
		state: a_pull.state,
		was_merged: typeof a_pull.merged_at === "string" ? a_pull.merged_at : null,
		created_at: a_pull.created_at ?? null,
		on_a_delivery_branch: is_a_delivery_branch(the_branch),
		labels: (a_pull.labels ?? []).map((a_label) => (typeof a_label === "string" ? a_label : a_label.name)),
		was_written_by_somebody: a_pull.user?.login ?? null,
	};
}

/**
 * The counts the page prints, and none of them a number somebody typed.
 *
 * **Three of the four attribution columns are computed from the items themselves**, so a project
 * that starts filing deliveries moves its own numbers without this file being told. The fourth —
 * how many distinct people wrote anything — is here because "who wrote this" is the question a
 * reader of a tracker asks first, and the answer is worth printing even when it is one name.
 */
function the_loop_of(a_issues, a_pull_requests) {
	const how_many_issues_with_the_filings_shape = a_issues.filter((an_issue) => an_issue.carries_the_filing_format).length;
	const how_many_delivered = a_pull_requests.filter((a_pull) => a_pull.on_a_delivery_branch);
	return {
		how_many_issues: a_issues.length,
		how_many_issues_are_open: a_issues.filter((an_issue) => an_issue.state === "open").length,
		how_many_carry_the_filings_shape: how_many_issues_with_the_filings_shape,
		how_many_pull_requests: a_pull_requests.length,
		how_many_were_merged: a_pull_requests.filter((a_pull) => a_pull.was_merged !== null).length,
		how_many_were_delivered_by_a_run: how_many_delivered.length,
		how_many_people_wrote_anything: new Set(
			[...a_issues, ...a_pull_requests]
				.map((an_item) => an_item.was_written_by_somebody)
				.filter((a_name) => a_name !== null),
		).size,
	};
}

/**
 * Every project, read from its own tracker, and refused by name when it cannot be read.
 *
 * **A project that cannot be read keeps its place.** GitHub answering 403 is a rate limit and
 * answering 404 is a rename, and neither of those means the family has five members — which is
 * the whole rule this family of pages states in its own words and then has to keep.
 */
export async function what_the_trackers_say(the_family, the_answer_for) {
	const the_readings = [];

	for (const a_project of the_family) {
		const the_itself = await the_answer_for(`repos/${a_project.owner}/${a_project.name}`);
		if (!the_itself.was_read) {
			the_readings.push({
				...a_project,
				url: `https://github.com/${a_project.owner}/${a_project.name}`,
				was_read: false,
				why_not: `${a_project.name} could not be read, and GitHub said: ${the_itself.why_not}`,
				what_it_says_it_is: null,
				the_issues: [],
				the_pull_requests: [],
				the_loop: null,
			});
			continue;
		}

		const the_issues_answer = await the_answer_for(
			`repos/${a_project.owner}/${a_project.name}/issues?state=all&per_page=100`,
		);
		const the_pulls_answer = await the_answer_for(
			`repos/${a_project.owner}/${a_project.name}/pulls?state=all&per_page=100`,
		);

		// **A tracker that could not be read is not a tracker with nothing on it.** GitHub answers
		// both endpoints with the same shape, so one refusal takes the project's tracker with it and
		// the project is refused by name rather than printed as an empty project.
		if (!the_issues_answer.was_read || !the_pulls_answer.was_read) {
			the_readings.push({
				...a_project,
				url: `https://github.com/${a_project.owner}/${a_project.name}`,
				was_read: false,
				why_not:
					`${a_project.name} could be read but its tracker could not, and GitHub said: ` +
					(the_issues_answer.was_read ? the_pulls_answer.why_not : the_issues_answer.why_not),
				what_it_says_it_is: the_itself.the_answer.description ?? null,
				the_issues: [],
				the_pull_requests: [],
				the_loop: null,
			});
			continue;
		}

		// **A pull request is also an issue, and counting it twice would be a number about the
		// workflow that the workflow never produced.** GitHub's issue endpoint carries both.
		const the_issues = the_issues_answer.the_answer
			.filter((an_item) => an_item.pull_request === undefined)
			.map(what_one_issue_says);
		const the_pull_requests = the_pulls_answer.the_answer.map(what_one_pull_request_says);

		the_readings.push({
			...a_project,
			url: `https://github.com/${a_project.owner}/${a_project.name}`,
			was_read: true,
			why_not: null,
			what_it_says_it_is: the_itself.the_answer.description ?? null,
			was_created_on: the_itself.the_answer.created_at ?? null,
			the_issues,
			the_pull_requests,
			the_loop: the_loop_of(the_issues, the_pull_requests),
		});
	}

	return the_readings;
}

/** The reader the command line uses: GitHub, with the token Actions already mints. */
export function the_reader_for_the_command_line(a_github_api, a_token) {
	return async (a_path) => {
		const the_answer = await fetch(`${a_github_api}/${a_path}`, {
			headers: {
				accept: "application/vnd.github+json",
				"x-github-api-version": "2022-11-28",
				...(a_token === undefined ? {} : { authorization: `Bearer ${a_token}` }),
			},
		});
		if (!the_answer.ok) {
			return { was_read: false, why_not: `answered ${the_answer.status}`, the_answer: null };
		}
		return { was_read: true, why_not: null, the_answer: await the_answer.json() };
	};
}

async function main() {
	const what_was_asked_for = the_flags_in(process.argv.slice(2));
	const where_the_state_should_land = resolve(what_was_asked_for.out ?? "src/state/the_family.json");
	const the_github_api = what_was_asked_for["github-api"] ?? "https://api.github.com";
	const the_token = process.env.GITHUB_TOKEN ?? undefined;

	const the_readings = await what_the_trackers_say(
		THE_FAMILY_THAT_BRIEFS_ITSELF,
		the_reader_for_the_command_line(the_github_api, the_token),
	);
	const the_state = {
		the_build: { read_at: new Date().toISOString(), from_where: the_github_api },
		the_family: the_readings,
		this_page: { owner: "steamnoid", name: "ai-sdlc-selfaware-landing" },
	};

	mkdirSync(dirname(where_the_state_should_land), { recursive: true });
	writeFileSync(where_the_state_should_land, `${JSON.stringify(the_state, null, "\t")}\n`);
	process.stdout.write(
		`read ${the_readings.filter((a) => a.was_read).length} of ${the_readings.length} trackers, ` +
			`wrote ${where_the_state_should_land}\n`,
	);
	for (const a_reading of the_readings.filter((a_project) => !a_project.was_read)) {
		process.stderr.write(`${a_reading.name}: ${a_reading.why_not}\n`);
	}
	return 0;
}

function the_flags_in(process_arguments) {
	const what_was_asked_for = {};
	for (let where_it_is = 0; where_it_is < process_arguments.length; where_it_is += 1) {
		if (!process_arguments[where_it_is].startsWith("--")) {
			continue;
		}
		what_was_asked_for[process_arguments[where_it_is].slice(2)] = process_arguments[where_it_is + 1] ?? true;
		where_it_is += 1;
	}
	return what_was_asked_for;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exitCode = await main().catch((the_refusal) => {
		process.stderr.write(`${the_refusal.name ?? "Error"}: ${the_refusal.message}\n`);
		return 1;
	});
}