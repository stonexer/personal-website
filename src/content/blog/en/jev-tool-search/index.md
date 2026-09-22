---
title: "How Jev Won 9× as Often in treg’s Search"
description: "How we added Jev to treg’s tool search and measured the results through agents’ next calls, with roughly nine interleaving wins for every lexical-search win."
pubDate: '2026-09-22'
slug: 'jev-tool-search'
tags: ['agents', 'search', 'treg', 'jev']
---

We’re building [treg](https://treg.to) to help agents find and call external APIs. Our [public catalog](https://treg.to/catalog) has more than 3,600 tools, covering everything from web and social data to company research, financial prices, and image and video generation.

That coverage creates a search problem. An agent has one task in front of it. Which of those thousands of tools should it call?

Even “find a person” can mean several things: search for people who meet certain criteria, enrich a profile, or find an email address. Several providers may offer each capability. Meanwhile, the agent’s query often includes a company name, a date range, or a specific platform. It describes the job, using words that may never appear in an API description.

We added TypeSafe’s Jev to our production search to judge whether candidate tools fit the task. Then we watched what agents actually called. In an interleaved experiment, the Jev search variant earned roughly nine points for every point earned by our original lexical search, excluding ties.

Here’s what we changed, how we measured it, and what still needs work.

<figure class="jev-figure" id="jev-figure-1"><svg class="illustration-desktop" viewBox="0 0 720 318" role="img" aria-labelledby="usage-desktop-title"><title id="usage-desktop-title">An agent searches treg for a web scraping tool, calls anyapi, and receives page content.</title><g font-family="Arial, sans-serif" fill="currentColor"><text x="24" y="31" font-size="18" fill="currentColor" font-weight="700">From task to tool call</text><g id="usage-step-1-desktop" transform="translate(24 62)"><title>Describe the task</title><rect x="0" y="0" width="204" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--muted)" font-weight="500">01  Describe the task</text><path d="M16,41 L188,41" fill="none" stroke="var(--line)" stroke-width="1"/><rect x="16" y="57" width="172" height="76" rx="5" fill="var(--code-bg)" stroke="none"/><text x="30" y="84" font-size="16" fill="currentColor" font-weight="500">&gt; Scrape this page</text><text x="30" y="111" font-size="14" fill="var(--muted)" font-weight="400">Return page content</text><text x="16" y="167" font-size="13" fill="var(--muted)" font-weight="400">Search with the task</text><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">No API name needed</text></g><path d="M232,173 h20 m-5,-5 l5,5 -5,5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><g id="usage-step-2-desktop" transform="translate(258 62)"><title>Return relevant tools</title><rect x="0" y="0" width="204" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--judged)" font-weight="500">02  Search treg</text><path d="M16,41 L188,41" fill="none" stroke="var(--line)" stroke-width="1"/><rect x="16" y="58" width="172" height="47" rx="5" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="28" y="79" font-size="14" fill="var(--judged)" font-weight="700">anyapi</text><text x="28" y="97" font-size="12" fill="currentColor" font-weight="400">Web scraping</text><rect x="16" y="115" width="172" height="47" rx="5" fill="var(--surface)" stroke="var(--line)"/><text x="28" y="136" font-size="14" fill="currentColor" font-weight="500">dataforseo</text><text x="28" y="154" font-size="12" fill="var(--muted)" font-weight="400">Raw HTML</text><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">treg returns candidates</text></g><path d="M466,173 h20 m-5,-5 l5,5 -5,5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><g id="usage-step-3-desktop" transform="translate(492 62)"><title>Call a tool and get results</title><rect x="0" y="0" width="204" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--judged)" font-weight="500">03  Choose and call</text><path d="M16,41 L188,41" fill="none" stroke="var(--line)" stroke-width="1"/><text x="16" y="72" font-size="12" fill="var(--judged)" font-weight="500">anyapi.web.scrape</text><rect x="16" y="86" width="172" height="76" rx="5" fill="var(--judged-soft)" stroke="none"/><text x="30" y="110" font-size="14" fill="var(--judged)" font-weight="500">Page content</text><path d="M30,124 L169,124" fill="none" stroke="var(--judged)" stroke-width="2"/><path d="M30,136 L147,136" fill="none" stroke="var(--judged)" stroke-width="2"/><path d="M30,148 L126,148" fill="none" stroke="var(--judged)" stroke-width="2"/><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">Use the result to continue</text></g><text x="24" y="302" font-size="11" fill="var(--muted)" font-weight="400">Illustrative workflow</text></g></svg><svg class="illustration-mobile" viewBox="0 0 360 782" role="img" aria-labelledby="usage-mobile-title"><title id="usage-mobile-title">An agent searches treg for a web scraping tool, calls anyapi, and receives page content.</title><g font-family="Arial, sans-serif" fill="currentColor"><text x="24" y="31" font-size="18" fill="currentColor" font-weight="700">From task to tool call</text><g id="usage-step-1-mobile" transform="translate(24 62)"><title>Describe the task</title><rect x="0" y="0" width="312" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--muted)" font-weight="500">01  Describe the task</text><path d="M16,41 L296,41" fill="none" stroke="var(--line)" stroke-width="1"/><rect x="16" y="57" width="280" height="76" rx="5" fill="var(--code-bg)" stroke="none"/><text x="30" y="84" font-size="16" fill="currentColor" font-weight="500">&gt; Scrape this page</text><text x="30" y="111" font-size="14" fill="var(--muted)" font-weight="400">Return page content</text><text x="16" y="167" font-size="13" fill="var(--muted)" font-weight="400">Search with the task</text><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">No API name needed</text></g><path d="M180,277 v20 m-5,-5 l5,5 5,-5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><g id="usage-step-2-mobile" transform="translate(24 300)"><title>Return relevant tools</title><rect x="0" y="0" width="312" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--judged)" font-weight="500">02  Search treg</text><path d="M16,41 L296,41" fill="none" stroke="var(--line)" stroke-width="1"/><rect x="16" y="58" width="280" height="47" rx="5" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="28" y="79" font-size="14" fill="var(--judged)" font-weight="700">anyapi</text><text x="28" y="97" font-size="12" fill="currentColor" font-weight="400">Web scraping</text><rect x="16" y="115" width="280" height="47" rx="5" fill="var(--surface)" stroke="var(--line)"/><text x="28" y="136" font-size="14" fill="currentColor" font-weight="500">dataforseo</text><text x="28" y="154" font-size="12" fill="var(--muted)" font-weight="400">Raw HTML</text><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">treg returns candidates</text></g><path d="M180,515 v20 m-5,-5 l5,5 5,-5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><g id="usage-step-3-mobile" transform="translate(24 538)"><title>Call a tool and get results</title><rect x="0" y="0" width="312" height="210" rx="8" fill="var(--surface)" stroke="var(--line)"/><text x="16" y="27" font-size="12" fill="var(--judged)" font-weight="500">03  Choose and call</text><path d="M16,41 L296,41" fill="none" stroke="var(--line)" stroke-width="1"/><text x="16" y="72" font-size="12" fill="var(--judged)" font-weight="500">anyapi.web.scrape</text><rect x="16" y="86" width="280" height="76" rx="5" fill="var(--judged-soft)" stroke="none"/><text x="30" y="110" font-size="14" fill="var(--judged)" font-weight="500">Page content</text><path d="M30,124 L277,124" fill="none" stroke="var(--judged)" stroke-width="2"/><path d="M30,136 L255,136" fill="none" stroke="var(--judged)" stroke-width="2"/><path d="M30,148 L234,148" fill="none" stroke="var(--judged)" stroke-width="2"/><text x="16" y="189" font-size="13" fill="var(--muted)" font-weight="400">Use the result to continue</text></g><text x="24" y="766" font-size="11" fill="var(--muted)" font-weight="400">Illustrative workflow</text></g></svg><figcaption><b>Figure 1</b> From a task to a tool call. Search supplies candidates; the agent chooses a tool and calls it through treg.</figcaption></figure>

## When the tool exists but search misses it

Our original `catalog_search` used lexical matching: tokenize the query, remove stopwords, score with BM25, and require most of the rare terms to match. It ran in a few milliseconds and was easy to debug. We could inspect the matched terms and see why a result appeared or disappeared.

But our empty-result logs included queries for capabilities we already had.

Consider this one:

> apple stock closing prices for last year

Our matching rule identified six rare terms and required four matches. Yet “Apple” and “last year” are values the agent would pass to a tool. The description might simply say “daily prices by ticker.” A relevant tool could fail the matching threshold because its description didn’t name the stock or the time period.

The agent had made its request more specific, and our search had made it harder to find a tool. It shouldn’t have to strip out those details and guess our catalog’s vocabulary first.

<figure class="jev-figure jev-figure-wide" id="jev-figure-2"><div class="jev-diagram-scroll" tabindex="0" role="group" aria-label="Scrollable diagram"><svg viewBox="0 0 720 256" role="img" aria-label="Both price tools miss the matching threshold. Filled squares indicate matches. This illustrates lexical filtering only: the latest-price tool cannot supply a full year of history."><defs></defs><g font-family="Arial, sans-serif" font-size="12" fill="currentColor"><text x="16" y="34" font-size="11" opacity=".7">Six query terms</text><text x="16" y="52" font-size="10" opacity=".55">Catalog matches</text><g text-anchor="middle"><text x="250" y="34">apple</text><text x="250" y="52" font-size="10" opacity=".55">16</text><text x="325" y="34">stock</text><text x="325" y="52" font-size="10" opacity=".55">70</text><text x="400" y="34">closing</text><text x="400" y="52" font-size="10" opacity=".55">2</text><text x="475" y="34">prices</text><text x="475" y="52" font-size="10" opacity=".55">27</text><text x="550" y="34">last</text><text x="550" y="52" font-size="10" opacity=".55">37</text><text x="625" y="34">year</text><text x="625" y="52" font-size="10" opacity=".55">15</text></g><line x1="16" y1="66" x2="704" y2="66" stroke="currentColor" stroke-opacity=".25"/><text x="16" y="104">tiingo.daily.prices</text><text x="16" y="158">marketstack.eod.latest</text><text x="690" y="104" text-anchor="end">3 / 6</text><text x="690" y="158" text-anchor="end">3 / 6</text></g><g stroke="currentColor" stroke-opacity=".45" fill="none"><rect x="240" y="90" width="20" height="20"/><rect x="315" y="90" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="390" y="90" width="20" height="20"/><rect x="465" y="90" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="540" y="90" width="20" height="20"/><rect x="615" y="90" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="240" y="144" width="20" height="20"/><rect x="315" y="144" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="390" y="144" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="465" y="144" width="20" height="20" fill="var(--lex)" stroke="none"/><rect x="540" y="144" width="20" height="20"/><rect x="615" y="144" width="20" height="20"/></g><g font-family="Arial, sans-serif" font-size="11" fill="currentColor"><line x1="16" y1="188" x2="704" y2="188" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/><text x="16" y="212" opacity=".8">Threshold: match 4 of 6 rare terms → both miss by one; no results</text><text x="16" y="238" opacity=".55">Parameter values need not appear in a tool description.</text></g></svg></div><figcaption><b>Figure 2</b> Both price tools miss the matching threshold. Filled squares indicate matches. This illustrates lexical filtering only: the latest-price tool cannot supply a full year of history.</figcaption></figure>

We also saw the opposite problem: the words matched, but the tool didn’t fit.

For “trending TikTok videos today,” five of the first six results were Douyin charts. Their descriptions contained “TikTok,” “trending,” and “videos.” Lexical overlap wasn’t enough to distinguish the platforms.

## What agents were trying to do

After adding Jev, we revisited queries like these and compared the results with the agent’s next call.

**A web scraping query returned social post scrapers.**

For “scrape webpage html fetch url content,” the original results favored Instagram and LinkedIn post scrapers. Their descriptions also used words like “fetch,” “content,” and “url.”

With broader retrieval followed by Jev’s judgment, the results included anyapi’s general web scraper, scored at 0.90, and dataforseo’s raw HTML tool, scored at 0.71. Neither had appeared in the original result list. The agent then called `anyapi.web.scrape`.

**A people search returned enrichment and email tools.**

For “people search LinkedIn professional profiles,” the original results favored `people.enrich` and `people.email.find`. Those help with an already identified person or an email lookup. Jev retained tools for searching LinkedIn profiles, and the agent called the harvestapi tool, which hadn’t appeared in the original results.

| Original lexical results, excerpt | Results retained by Jev | Jev score |
| --- | --- | --- |
| `treg.people.enrich` | `moltsets.linkedin.profile.search` | 0.91 |
| `crustdata.people.enrich` | `harvestapi.linkedin.profile.search` | 0.95 |
| `treg.people.email.find` | `anyapi.linkedin.search_profiles_thin` | 0.78 |
| `leadmagic.x.b2b-profile-email` | `anyapi.linkedin.search_profiles_email` | 0.78 |

Jev retained four of the 30 candidates. Filtered candidates included `crustdata.people.enrich` and `treg.people.email.find`.

The next call was **`harvestapi.linkedin.profile.search`**. Only the Jev result list contained it, so Jev received the point.

We saw a similar distinction in “search people by company name domain employees”: lexical search returned email-finding tools, while Jev retained tools for finding employees by company.

These aren’t complicated requests. But small differences in intent change which tool is useful.

## Why we tried Jev

Retrieving candidates and then judging relevance is a familiar pattern in search and RAG. We wanted to find out whether it would help agents navigate our tool catalog with fewer retries.

Jev is TypeSafe’s System One model. It takes a state and a set of typed questions, then returns answers without generating an explanation. We use its Noul type to ask a yes-or-no question and receive a probability for “yes.”

For each candidate, the question is essentially:

> Would calling this tool directly accomplish the task, or be a necessary step toward it, on the platform or data source the task requires?

A few properties made it straightforward to try:

- **Batch judgment.** We can ask about 30 candidates in one request, sharing the same state.
- **Numeric answers.** The scores fit into our existing filtering and ranking rules.
- **Low input cost.** At the price used in this experiment, $42 per billion input tokens, a search with roughly 4,500 input tokens costs about $0.0002 in model input charges.

We later ran offline comparisons with Qwen3-Reranker and community open-source implementations, using the same queries, candidates, and tool descriptions. Both Jev and Qwen corrected some lexical ranking errors. The sample was too small to establish a general winner.

We’re keeping Jev for now while continuing to compare relevance, latency, and reliability. The production results in this article compare our Jev search variant with our original lexical search. We haven’t completed a comparison between models under equivalent production deployment conditions.

For a task such as “find the person leading this company, then find their email,” the agent still handles the steps. We’re improving how it finds a tool for each step. Query rewriting when candidate scores are low is something we’d like to explore next.

## How it fits into search

We kept lexical search and added judgment after candidate retrieval.

<figure class="jev-figure jev-figure-wide" id="jev-figure-3"><div class="jev-diagram-scroll" tabindex="0" role="group" aria-label="Scrollable diagram"><svg viewBox="0 0 860 230" role="img" aria-label="Broader retrieval feeds candidates to Jev. If judgment fails, search falls back to the original lexical results."><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><g font-family="Arial, sans-serif" font-size="13" fill="currentColor"><rect x="20" y="70" width="200" height="96" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="120" y="96" text-anchor="middle" font-weight="700">Lexical retrieval</text><text x="120" y="118" text-anchor="middle" font-size="12" opacity=".8">Match any rare term</text><text x="120" y="140" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" opacity=".8">Catalog → 30 candidates</text><rect x="300" y="70" width="230" height="96" fill="none" stroke="var(--judged)" stroke-width="2"/><text x="415" y="96" text-anchor="middle" font-weight="700" fill="var(--judged)">Jev</text><text x="415" y="118" text-anchor="middle" font-size="12" opacity=".85">30 Noul questions, one request</text><text x="415" y="140" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" opacity=".8">p50 ≈ 160 ms · ~4.5k tokens</text><rect x="610" y="70" width="230" height="96" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="725" y="96" text-anchor="middle" font-weight="700">Group + existing ranking</text><text x="725" y="118" text-anchor="middle" font-size="12" opacity=".8">&lt; 0.4 drop · ≥ 0.7 prioritize</text><text x="725" y="140" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" opacity=".8">Keep lexical order → 8 tools</text><line x1="222" y1="118" x2="296" y2="118" stroke="currentColor" marker-end="url(#arr)"/><text x="259" y="108" text-anchor="middle" font-size="11" opacity=".7">Candidates</text><line x1="532" y1="118" x2="606" y2="118" stroke="currentColor" marker-end="url(#arr)"/><text x="569" y="108" text-anchor="middle" font-size="11" opacity=".7">30 scores</text><path d="M120,70 L120,34 L725,34 L725,66" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity=".6" marker-end="url(#arr)"/><text x="422" y="26" text-anchor="middle" font-size="11" opacity=".75">Timeout &gt; 2.5 s, error, or unconfigured: return original lexical results</text><text x="20" y="206" font-size="11" opacity=".7">Code handles retrieval, grouping, and fallback. Jev scores each candidate.</text></g></svg></div><figcaption><b>Figure 3</b> Broader retrieval feeds candidates to Jev. If judgment fails, search falls back to the original lexical results.</figcaption></figure>

**First, broaden retrieval.** Instead of requiring most rare terms to match, we accept a match on any rare term and take the top 30 candidates by lexical score. That lets stock-price tools into the candidate set. It can also admit an App Store search tool matching “Apple,” so we need a second pass.

**Then, judge each candidate.** We send the query and candidate descriptions in one state, with a Noul question for each candidate. Here’s an abbreviated request showing two of them:

```json
{
  "model": "jev-latest",
  "state": {
    "task": "apple stock closing prices for last year",
    "candidates": [
      {
        "i": 0,
        "id": "tiingo.daily.prices",
        "name": "End-of-day stock prices by ticker - adjusted, 30+ years",
        "capability": "End-of-day price history for a ticker",
        "platform": "stocks"
      },
      {
        "i": 1,
        "id": "serpapi.app-store.search.apps",
        "name": "Search apps in the App Store by keyword",
        "platform": "app-store"
      }
    ]
  },
  "questions": {
    "c0": {
      "type": "noul",
      "instructions": "Calling the API endpoint `candidates[0]` would directly accomplish, or be a necessary step of, the task described in `task`, on the platform or data source the task implies."
    },
    "c1": {
      "type": "noul",
      "instructions": "Calling the API endpoint `candidates[1]` would directly accomplish, or be a necessary step of, the task described in `task`, on the platform or data source the task implies."
    }
  }
}
```

In this example, the stock-price tool scored 0.91 and the App Store tool scored 0.06.

**Finally, filter and group.** We discard candidates below 0.4. Candidates scoring at least 0.7 go into the priority group; those from 0.4 up to 0.7 go into the next group. Within each group, we preserve lexical order, and our existing adjustments for observed success rates and price still apply.

We don’t sort purely by Jev’s score. A small difference in model scores shouldn’t automatically override the other information we have about a tool.

## Measuring what agents chose

Reading a result list can tell us that several tools look plausible. The agent’s next call tells us which one it actually used.

Because treg handles both search and calls, we can connect those actions. That gives us a way to evaluate search before building a manually labeled dataset. A call doesn’t prove the task succeeded, but it provides feedback beyond our own inspection of the results.

We used **interleaving** for the main experiment. We generated both result lists and combined them using team draft: randomly choose which side picks first in each round, then let each side contribute its highest-ranked tool that hasn’t already been included.

<figure class="jev-figure jev-figure-wide" id="jev-figure-4"><div class="jev-diagram-scroll" tabindex="0" role="group" aria-label="Scrollable diagram"><svg viewBox="0 0 860 500" role="img" aria-label="Adapted from a real web scraping query. To illustrate deduplication, the two general tools are added to the bottom of the lexical list here; neither appeared in the actual lexical result list. Colors show which side selected each tool; scoring uses the original rankings."><g font-family="Arial, sans-serif" fill="currentColor"><text x="24" y="30" font-size="14" font-weight="700">Query: scrape webpage html fetch url content</text><text x="24" y="55" font-size="12" opacity=".65">A general web scraping query returned social post scrapers.</text><text x="24" y="108" font-size="14" font-weight="700" fill="var(--lex)">Lexical results</text><text x="24" y="178" font-size="14" font-weight="700" fill="var(--judged)">Jev results</text><rect x="132" y="80" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="144" y="103" font-size="11" opacity=".65">1</text><text x="223" y="103" text-anchor="middle" font-size="14" font-weight="700">Instagram</text><text x="223" y="123" text-anchor="middle" font-size="12">Post scraping</text><rect x="308" y="80" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="320" y="103" font-size="11" opacity=".65">2</text><text x="399" y="103" text-anchor="middle" font-size="14" font-weight="700">LinkedIn</text><text x="399" y="123" text-anchor="middle" font-size="12">Post scraping</text><rect x="484" y="80" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="496" y="103" font-size="11" opacity=".65">3</text><text x="575" y="103" text-anchor="middle" font-size="14" font-weight="700">anyapi</text><text x="575" y="123" text-anchor="middle" font-size="12">Web scraping</text><rect x="660" y="80" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="672" y="103" font-size="11" opacity=".65">4</text><text x="751" y="103" text-anchor="middle" font-size="14" font-weight="700">dataforseo</text><text x="751" y="123" text-anchor="middle" font-size="12">Raw HTML</text><rect x="132" y="150" width="160" height="54" rx="3" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="144" y="173" font-size="11" opacity=".65">1</text><text x="223" y="173" text-anchor="middle" font-size="14" font-weight="700">anyapi</text><text x="223" y="193" text-anchor="middle" font-size="12">Web scraping</text><rect x="308" y="150" width="160" height="54" rx="3" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="320" y="173" font-size="11" opacity=".65">2</text><text x="399" y="173" text-anchor="middle" font-size="14" font-weight="700">dataforseo</text><text x="399" y="193" text-anchor="middle" font-size="12">Raw HTML</text><text x="496" y="174" font-size="12" opacity=".75">Jev retains two general tools</text><text x="496" y="194" font-size="12" opacity=".75">Filters out platform-specific scrapers</text><line x1="24" y1="228" x2="836" y2="228" stroke="var(--line)"/><text x="24" y="258" font-size="14" font-weight="700">Interleaving</text><text x="300" y="288" text-anchor="middle" font-size="12" opacity=".75">Round 1 · Jev picks first</text><text x="652" y="288" text-anchor="middle" font-size="12" opacity=".75">Round 2 · Lexical picks first</text><line x1="132" y1="298" x2="468" y2="298" stroke="var(--line)"/><line x1="484" y1="298" x2="820" y2="298" stroke="var(--line)"/><rect x="132" y="312" width="160" height="54" rx="3" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="144" y="335" font-size="11" opacity=".65">1</text><text x="223" y="335" text-anchor="middle" font-size="14" font-weight="700">anyapi</text><text x="223" y="355" text-anchor="middle" font-size="12">Web scraping</text><text x="212" y="389" text-anchor="middle" font-size="12" fill="var(--judged)">Picked by Jev</text><rect x="308" y="312" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="320" y="335" font-size="11" opacity=".65">2</text><text x="399" y="335" text-anchor="middle" font-size="14" font-weight="700">Instagram</text><text x="399" y="355" text-anchor="middle" font-size="12">Post scraping</text><text x="388" y="389" text-anchor="middle" font-size="12" fill="var(--lex)">Picked by lexical</text><rect x="484" y="312" width="160" height="54" rx="3" fill="var(--lex-soft)" stroke="var(--lex)"/><text x="496" y="335" font-size="11" opacity=".65">3</text><text x="575" y="335" text-anchor="middle" font-size="14" font-weight="700">LinkedIn</text><text x="575" y="355" text-anchor="middle" font-size="12">Post scraping</text><text x="564" y="389" text-anchor="middle" font-size="12" fill="var(--lex)">Picked by lexical</text><rect x="660" y="312" width="160" height="54" rx="3" fill="var(--judged-soft)" stroke="var(--judged)"/><text x="672" y="335" font-size="11" opacity=".65">4</text><text x="751" y="335" text-anchor="middle" font-size="14" font-weight="700">dataforseo</text><text x="751" y="355" text-anchor="middle" font-size="12">Raw HTML</text><text x="740" y="389" text-anchor="middle" font-size="12" fill="var(--judged)">Picked by Jev</text><text x="132" y="417" font-size="12" opacity=".75">The remaining lexical tools are already included. Skip duplicates.</text><rect x="24" y="438" width="812" height="42" rx="3" fill="var(--judged-soft)"/><text x="40" y="465" font-size="13">Agent calls anyapi.web.scrape: Jev rank 1, lexical rank 3 → <tspan font-weight="700" fill="var(--judged)">Point to Jev</tspan></text></g></svg></div><figcaption><b>Figure 4</b> Adapted from a real web scraping query. To illustrate deduplication, the two general tools are added to the bottom of the lexical list here; neither appeared in the actual lexical result list. Colors show which side selected each tool; scoring uses the original rankings.</figcaption></figure>

After the agent called a tool, we applied our own scoring rule to the two original lists:

- If only one list contained the tool, that variant received the point.
- If both contained it, the variant that ranked it higher received the point.
- If the ranks were equal, we recorded a tie.

This lets us compare the variants on the same query. The combined list still has a length limit, so it doesn’t preserve every result from both sides.

We also reserved small groups of traffic for lexical-only and Jev-only results. Those let us examine calls after search and immediate repeat searches separately from the interleaved experiment.

## What we’ve seen so far

The latest interleaving tally favors Jev by about **8.6:1**, excluding ties, rounded to **9:1** in the headline. That ratio measures points under the attribution rule above, rather than a ninefold increase in search accuracy.

Our earlier online observation also showed more searches followed by calls, and fewer immediate repeat searches. The figures below are approximate.

| Jev latency in that observation | Time |
| --- | --- |
| p50 | 160 ms |
| p95 | 280 ms |

**Did a search lead to a call?** We checked whether the agent called a displayed tool within ten minutes, separating queries by whether the original lexical search had results.

| Original lexical search | Lexical-only group | Jev-only group |
| --- | --- | --- |
| Had results | 47% | 72% |
| Had no results | No displayed tool to call | 26% |

For queries where lexical search already had results, the call rate was about 25 percentage points higher in the Jev group. For queries where lexical search had no results, roughly one in four searches in the Jev group led to a call.

An empty list offers nothing to call, so that second row isn’t a like-for-like comparison of call rates. It also says nothing about whether an agent completed the task elsewhere.

**Did the agent immediately search again?** We counted another search within two minutes, with no intervening call.

| Lexical-only | Interleaved | Jev-only |
| --- | --- | --- |
| 59% | 43% | 33% |

These observations are enough for us to keep using the approach. They compare broader retrieval plus Jev judgment with the original lexical pipeline, so they don’t isolate the model’s contribution from the retrieval change.

Repeat searches need interpretation, too. When we reviewed multi-step sessions, some agents were rephrasing a failed query. Others were looking for a prerequisite, such as a place ID before fetching map reviews. Sometimes a useful tool had already been shown and the agent kept searching anyway.

We still need to see whether these differences hold over time, and whether the tools agents call return what they need.

## Where strict matching falls short

One query asked for “hh.ru vacancies search.” At the time, our catalog had no tool for that job site.

Lexical search matched “vacancies” and returned five LinkedIn and general job-search tools. Jev scored all 30 candidates below 0.4, leaving an empty list. The agent eventually called a general job-search tool from the lexical results, giving lexical search the point.

<figure class="jev-figure" id="jev-figure-5"><svg class="illustration-desktop" viewBox="0 0 720 396" role="img" aria-labelledby="fallback-desktop-title"><title id="fallback-desktop-title">For an hh.ru query, Jev returns no results while lexical search offers general alternatives. The agent calls an alternative, but task completion is unknown.</title><g font-family="Arial, sans-serif" fill="currentColor"><text x="24" y="32" font-size="17" fill="currentColor" font-weight="700">No exact match. Offer alternatives?</text><rect x="24" y="52" width="672" height="48" rx="5" fill="var(--code-bg)" stroke="none"/><text x="360.0" y="82" font-size="16" fill="currentColor" font-weight="500" text-anchor="middle">Query: find jobs on hh.ru</text><g id="choice-path-1-desktop" transform="translate(24 132)"><title>Strict matching returns no results</title><rect x="0" y="0" width="322" height="220" rx="8" fill="var(--surface)" stroke="var(--judged)"/><text x="18" y="29" font-size="14" fill="var(--judged)" font-weight="700">Jev · Match the platform</text><rect x="18" y="49" width="286" height="74" rx="5" fill="var(--judged-soft)" stroke="none"/><text x="161.0" y="91" font-size="19" fill="var(--judged)" font-weight="500" text-anchor="middle">No matching tool</text><text x="18" y="153" font-size="14" fill="currentColor" font-weight="400">Respects the requested platform</text><text x="18" y="179" font-size="13" fill="var(--muted)" font-weight="400">But leaves nothing to call</text></g><g id="choice-path-2-desktop" transform="translate(374 132)"><title>The agent uses a general alternative</title><rect x="0" y="0" width="322" height="220" rx="8" fill="var(--surface)" stroke="var(--lex)"/><text x="18" y="29" font-size="14" fill="var(--lex)" font-weight="700">Lexical · Related capabilities</text><rect x="18" y="49" width="286" height="74" rx="5" fill="var(--lex-soft)" stroke="none"/><text x="161.0" y="80" font-size="19" fill="var(--lex)" font-weight="500" text-anchor="middle">General job search</text><text x="161.0" y="107" font-size="12" fill="var(--muted)" font-weight="400" text-anchor="middle">Not an hh.ru-specific tool</text><text x="18" y="154" font-size="15" fill="var(--lex)" font-weight="700">✓ The agent calls this tool</text><text x="18" y="179" font-size="13" fill="var(--muted)" font-weight="400">This point goes to lexical</text></g><path d="M360,100 v16 H185 v12 M360,116 H535 v12" fill="none" stroke="var(--muted)" stroke-width="1.5"/><text x="24" y="382" font-size="13" fill="var(--muted)" font-weight="400">A call does not prove it found jobs on the requested platform.</text></g></svg><svg class="illustration-mobile" viewBox="0 0 360 698" role="img" aria-labelledby="fallback-mobile-title"><title id="fallback-mobile-title">For an hh.ru query, Jev returns no results while lexical search offers general alternatives. The agent calls an alternative, but task completion is unknown.</title><g font-family="Arial, sans-serif" fill="currentColor"><text x="24" y="32" font-size="17" fill="currentColor" font-weight="700">No exact match. Offer alternatives?</text><rect x="24" y="52" width="312" height="48" rx="5" fill="var(--code-bg)" stroke="none"/><text x="180.0" y="82" font-size="16" fill="currentColor" font-weight="500" text-anchor="middle">Query: find jobs on hh.ru</text><g id="choice-path-1-mobile" transform="translate(24 134)"><title>Strict matching returns no results</title><rect x="0" y="0" width="312" height="220" rx="8" fill="var(--surface)" stroke="var(--judged)"/><text x="18" y="29" font-size="14" fill="var(--judged)" font-weight="700">Jev · Match the platform</text><rect x="18" y="49" width="276" height="74" rx="5" fill="var(--judged-soft)" stroke="none"/><text x="156.0" y="91" font-size="19" fill="var(--judged)" font-weight="500" text-anchor="middle">No matching tool</text><text x="18" y="153" font-size="14" fill="currentColor" font-weight="400">Respects the requested platform</text><text x="18" y="179" font-size="13" fill="var(--muted)" font-weight="400">But leaves nothing to call</text></g><g id="choice-path-2-mobile" transform="translate(24 388)"><title>The agent uses a general alternative</title><rect x="0" y="0" width="312" height="220" rx="8" fill="var(--surface)" stroke="var(--lex)"/><text x="18" y="29" font-size="14" fill="var(--lex)" font-weight="700">Lexical · Related capabilities</text><rect x="18" y="49" width="276" height="74" rx="5" fill="var(--lex-soft)" stroke="none"/><text x="156.0" y="80" font-size="19" fill="var(--lex)" font-weight="500" text-anchor="middle">General job search</text><text x="156.0" y="107" font-size="12" fill="var(--muted)" font-weight="400" text-anchor="middle">Not an hh.ru-specific tool</text><text x="18" y="154" font-size="15" fill="var(--lex)" font-weight="700">✓ The agent calls this tool</text><text x="18" y="179" font-size="13" fill="var(--muted)" font-weight="400">This point goes to lexical</text></g><path d="M180,106 v20 m-5,-5 l5,5 5,-5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><text x="24" y="378" font-size="12" fill="var(--muted)" font-weight="400">Same query, another result</text><text x="24" y="655" font-size="14" fill="var(--muted)" font-weight="400">Using an alternative does not prove</text><text x="24" y="678" font-size="14" fill="var(--muted)" font-weight="400">it found jobs on the requested site.</text></g></svg><figcaption><b>Figure 5</b> Strict matching returns nothing, but the agent uses a general alternative. The next question is how to explain the limits of those alternatives.</figcaption></figure>

Jev had a reasonable basis for rejecting those tools: a LinkedIn search doesn’t directly answer a request for hh.ru listings. But the agent’s choice suggests it was willing to try an alternative. We can’t tell from the call alone whether that alternative completed the task.

That leaves a product question: how should search present a useful substitute when the exact source isn’t available?

We’d like to make the distinction explicit: say that we don’t have a tool for the requested platform, then separately list possible alternatives and their limits.

Empty results also help us decide what to build. Repeated requests for capabilities such as reading and writing office data give us a concrete list to investigate. We first check whether existing tools can do the job, then decide whether to improve search or add coverage.

Rejecting all 30 candidates doesn’t establish that the catalog has no suitable tool. Retrieval may have missed it, or Jev may have filtered it incorrectly. Likewise, recovering an empty query doesn’t always mean we needed another synonym. In the stock-price example, task parameters had raised the matching threshold too far.

And some intent never makes it into the query. “Find a person” may not say whether the agent needs a profile or an email. Jev can only judge what the query and candidate descriptions tell it.

## 尾巴

This experiment showed us how agents actually look for tools, including problems we would have missed by inspecting result lists alone. We’ll keep reviewing candidates we filtered out, improving vocabulary coverage, and making it clearer when a tool is only a general alternative.

Those searches also help us decide what to add to treg. Our catalog doesn’t cover everything users want to do. We’ll keep adding tools based on those needs and sharing what we learn as we connect them and see them used.

If you have a task in mind for your agent, give it a try at [treg.to](https://treg.to). Let us know if you can’t find the right tool, or if the one you find doesn’t do the job. More tools are on the way. Stay tuned.
