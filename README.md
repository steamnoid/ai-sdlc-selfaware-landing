# AI SDLC — the page for the family that runs on itself

**The page:** <https://steamnoid.github.io/ai-sdlc-selfaware-landing>

Six repositories where [`ai-sdlc-os`](https://github.com/steamnoid/ai-sdlc-os) and its ports have
been pointed at their own issue trackers. This repository is the page that says what each one has
produced — and every fact on it was read out of the six rather than typed here.

```text
ai-sdlc-os-selfaware           the original, on its own tracker
ai-sdlc-os-plus-selfaware      the glossary-first version, on its own tracker
ai-sdlc-app-rs-selfaware       the Rust port with no agent framework, on its own tracker
ai-sdlc-app-rs-plus-selfaware  the workspace rewrite, on its own tracker
bestof-selfaware               the canonical repository, on its own tracker
bestof-fast-selfaware          the fast variant, on its own tracker
```

## The two rules

> **A fact is generated, or it is not on the page.**
>
> **A project is read, or the page says in words that it could not be.**

The first is the rule the whole family holds itself to. The second exists because this page serves
six repositories rather than one: a page about one can treat a failed read as fatal, while a page
about six would go down for everybody because one tracker answered 403.

## What the page can tell you, and what it cannot

**It reads a tracker. Nothing on these six trackers records who wrote what.** Three signals were
looked for:

| the signal | what the six hold |
|---|---|
| a pull request on a delivery branch — `aisdlc/issue-<n>-<run id>` | none |
| more than one author | none — one account wrote every issue and every pull request |
| the shape a filing is written in | five items, in one repository |

So the page prints the counts and **refuses the authorship**, and says so before the counts rather
than in a footnote. Each repository's own description is the one real statement about authorship,
and it is quoted verbatim.

**A shape is evidence and not a record** — a person who copied the filing agent's shape would be
counted by the same rule — so an item is labelled *carries the shape a filing is written in*, and no
more is claimed about it.

## It reads trackers, not checkouts

**Nothing here clones anything and nothing here runs a test suite**, because no working tree can be
asked what is on a tracker. About twenty API reads and a three-hundred-millisecond build, against
three and a half minutes and four test suites on
[`ai-sdlc-landing`](https://github.com/steamnoid/ai-sdlc-landing) — and the more reliable of the
two, because a collector that reads a sibling repository's files fails when somebody is halfway
through an edit in it.

## Working here

```bash
npm ci            # the lockfile is committed
npm run collect   # read the six trackers — the only thing that needs a token
npm test          # the suite: no network, no credential
./scripts/gate    # the suite and a build with no state at all
```

**The gate reaches no network and needs no credential.** No secret is configured in this repository;
CI reads the trackers with the token Actions mints.

## Why it is not a copy of the other pages

[`ai-sdlc-landing`](https://github.com/steamnoid/ai-sdlc-landing) and its siblings read working
trees to count tests. This one reads trackers, which no page in this family has done — the shape is
the same, the data source has no precedent here, and `AGENTS.md` says what that changes.