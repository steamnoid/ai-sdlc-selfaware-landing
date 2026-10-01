# AGENTS.md — `ai-sdlc-selfaware-landing`

A public page about six repositories, and what each one has produced since the system began
working on itself. **Live:** <https://steamnoid.github.io/ai-sdlc-selfaware-landing>

---

# The two rules

**A fact is generated, or it is not on the page.** The only hand-written thing here is the six
`owner/name` pairs and what each copies — a list of *where to look*, not a claim about what is
there. Every number on the page is counted out of a GitHub tracker at build time.

**A project is read, or the page says in words that it could not be.** GitHub answering 403 is a
rate limit; answering 404 is a rename. Neither means the family has five members, and a project
whose tracker cannot be read keeps its place with the reason and no counts beside it.

This page is a **view** of the trackers, not a claim about them. The trackers are the record.

---

# What the subject of this page is, and what that changes

**It reads a tracker, not a working tree.** Nothing here clones anything and nothing here runs a
test suite, because no working tree can be asked what is on a tracker. That makes it the fastest
page in this family — about twenty API reads and three and a half hundred milliseconds of build,
against three and a half minutes and four test suites on
[`ai-sdlc-landing`](../ai-sdlc-landing) — and it is also the **most reliable**, because a collector
that reads a sibling repository's files fails when somebody is halfway through an edit in that
repository. That happened to `ai-sdlc-landing` on the afternoon this repository was written: it
reported `IndentationError: expected an indented block after class definition` in a file somebody
was editing at the time.

**And so this page has no inheritance at all from that one.** The shape is the same — a collector
writes a state, the page prints only what the state holds, tests compare — but the *data source*
has no precedent in this family. None of the four existing landing pages has ever called the
GitHub API.

---

# The finding the page leads with, and why it is not a design failure

**Nothing on these six trackers records who wrote what.** Three signals were looked for and three
are absent:

| the signal | what the six hold |
|---|---|
| a pull request on a delivery branch | **none.** `ai-sdlc-os` names its deliveries `aisdlc/issue-<n>-<run id>`; every merged pull request on the six is named after what it changed |
| more than one author | **none.** One account wrote every issue and every pull request on all six |
| the shape a filing is written in | five items, in one repository |

So a page headed *"what the workflow delivered"* would be claiming all fifteen merged pull requests
are deliveries, and **there is nothing here that would let a reader tell that claim from a
hand-written commit.** The page therefore prints the counts and refuses the authorship, and it says
that **before** the counts rather than in a footnote — a reader who has already been told the
authorship is coming has been told something false.

**A shape is evidence and not a record.** The filing agent writes an issue with a heading and named
sections; a person who copied that shape would be counted by the same rule, and nothing in the
text of an issue would tell the two apart. So an item is labelled *carries the shape a filing is
written in*, and no more is claimed about it.

**The one thing that is a real record is each repository's own description**, and it is quoted
verbatim rather than summarised. Six of six state in their own words that the system works on them,
and that is the only statement on this page about authorship — attributed to the repository that
makes it.

---

# The rules this page holds itself to

Every one of these was found somewhere in this family by reading, or by a run that went green while
lying, and they are the reason the existing pages are worth anything.

1. **No number in the page's own prose that the page did not count.** Five such sentences existed
   in `ai-sdlc-landing`; four became false the day a repository answered 404, and the fifth was
   wrong on the live site the day it was written.
2. **No count read from one object beside items read from another.** The projection here carries its
   own counts, counted from the very items it prints, because the first version carried the
   collector's `the_loop` and would have shown a number above rows that added up to something else.
3. **A refusal is a value, not an absence**, and it is never a zero.
4. **The state is a build artefact and is never committed**, so a fresh clone has none and the page
   says so rather than rendering a fossil. **The gate proves that build**, because it is the one
   that had never been run.
5. **A rule that is too loose is worse than no rule.** `is_a_delivery_branch` first accepted any
   suffix and read `aisdlc/issue-12-someone-elses-work` as a delivery — which is the one rule on
   this page that could hand a delivery to a branch somebody pushed by hand.
6. **No number in a test either.** The first version of the page test typed `3 issues` against a
   fixture holding two, which is the disease the page exists to prevent, written into the file that
   checks it.

---

# Working here

```bash
npm ci                     # the lockfile is committed
npm run collect            # read the six trackers — needs a token, and this is the only thing that does
npm run build              # the page, from the state
npm test                   # the suite: no network, no credential
./scripts/gate             # the suite and a build with no state at all
```

**The gate needs no credential and reaches no network.** The reading happens in CI, where the token
Actions mints is already there — no secret is configured anywhere in this repository. Unauthenticated
the API allows sixty requests an hour *per address*, and a runner's address is shared with whatever
else GitHub is running on it, so about twenty reads fit inside that budget only if nothing else has
spent it.

**Read the trackers, and not the checkouts.** `AISDLC_WHETHER=` chooses nothing here: there is
nothing to point at. Six URLs are in `scripts/ask_the_trackers.mjs` and they are the whole
configuration.

---

# What this page does not do

- **It does not clone and does not run suites.** Nothing about *what the workflow produced* is
  answered by a codebase.
- **It does not count tests, lines or coverage.** That is `ai-sdlc-landing`'s subject; a second page
  of code statistics here would blur what this one is about.
- **It does not infer authorship** from branch names, labels or body shape beyond what a repository
  states about itself.
- **It does not draw a line it cannot check.** Where the trackers say nothing, it says they say
  nothing, which is a smaller claim than the one a feature list would want.

---

# Where the rest of the rules live

| Topic | Section |
|---|---|
| The state file and what may be printed from it | `src/page/what_the_page_says.mjs` |
| The six reads, and the reader the tests supply | `scripts/ask_the_trackers.mjs` |
| The scheduler, and what it actually costs | `AGENTS.md` in `ai-sdlc-landing`, measured over eight runs |
| The tracker-reader's refusals, and why they are thorough | the module docs of `ask_the_python_domain.py` and `read_the_rust_domain.mjs` in `ai-sdlc-os` |