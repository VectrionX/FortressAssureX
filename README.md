# FortressAssureX — evidence-led assessment MVP

FortressAssureX is a browser-only evidence register for authorized security assessment work. It records human-entered findings linked to stated evidence and provides a provisional, coverage-gated maturity indicator. It does not create findings or conclusions from text.

## Supported boundary

Evidence-backed human finding intake and maturity components are available for exactly:

1. **Architecture & Network**
2. **Vulnerability & Exposure**

A finding requires a title, observation, evidence reference, excerpt or locator, impact, recommendation, and assessor-selected severity. Other domains remain explicitly unsupported.

## Maturity model

The score is an ordinal indicator from 0–5, not a percentage or assurance result:

`score = Σ(component rating × fixed component weight)`

Both supported modules have a fixed weight of 50%. Ratings are entered by the assessor as integers from 0 to 5 and are shown with each component contribution. Evidence quantity does not inflate a rating: it only gates eligibility. A component is eligible only when it has at least one valid human finding with a supported module, non-empty evidence reference, non-empty excerpt/locator, and all required finding fields. The score is valid only when every supported module has an eligible evidence record and a rating. Missing or unknown ratings are invalid and are never silently treated as zero. This model does not measure control effectiveness, risk, compliance, or assurance; qualified human review remains required.

## Local evidence helper

The optional helper accepts caller-provided text or reads a selected file locally in the browser. Supported lexical text formats are `.txt`, `.text`, `.md`, `.csv`, `.log`, and `.report`; `.json` is additionally checked for malformed syntax. It checks the selected file's byte size before reading, is bounded to 1 MB and 2,000 lines by default, returns source- and line-addressable excerpts, and performs no network request, upload, or transmission. Unsupported extensions, binary/undecodable content, malformed JSON, read errors, oversize input, and empty input are reported clearly.

Parsing is lexical only. It never produces findings, infers severity, validates controls, or treats keywords as evidence. A user may copy a displayed excerpt into a human finding, then must verify it against the original source and provide the impact and recommendation themselves. Binary, encrypted, proprietary, malformed, or semantically complex formats are not supported.

## Assessment status

- **Not assessed** — no evidence-backed human findings exist for supported modules.
- **Evidence intake incomplete** — only part of the supported boundary has evidence.
- **Evidence recorded — human review required** — both modules have evidence; this is not an assurance conclusion.

Records and assessor ratings are held only in the active browser session. Preserve source artifacts under your organization’s retention process.

## Run locally

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
npm run audit:prod
```

## Responsible use

Use only authorized evidence. Review every excerpt against its source and obtain qualified review before relying on any indicator or finding. FortressAssureX is not a substitute for a formal assessment, technical validation, legal advice, or a compliance program.
