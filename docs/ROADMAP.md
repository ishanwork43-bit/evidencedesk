# Roadmap

## Current release

- Markdown and text ingestion with overlapping chunks.
- In-memory TF-IDF retrieval with cosine similarity.
- Extractive responses with source identifiers and retrieval scores.
- Optional OpenAI generation from retrieved passages.
- Retrieval-based abstention, unit tests, a smoke benchmark, and CI configuration.
- Static browser interface with local uploads and Netlify build configuration.

## Semantic retrieval and API

- Compare sentence-transformer embeddings against the lexical baseline on held-out questions.
- Persist document chunks and vectors with versioned index metadata.
- Preserve PDF page references during ingestion.
- Add an HTTP API with validated request and response schemas.

Acceptance: reproducible retrieval comparison, API integration tests, and source references that resolve to the indexed passages.

## Hybrid search and evaluation

- Combine lexical and dense retrieval.
- Evaluate reranking against quality, latency, and cost targets.
- Expand the labeled dataset to cover paraphrases, conflicting evidence, and unanswerable questions.
- Measure citation support independently from retrieval relevance.

Acceptance: publish configurations, dataset provenance, raw results, and failure examples for each retrieval strategy.

## Deployment and access controls

- Authenticate users and enforce document access controls during retrieval.
- Add background ingestion with idempotent jobs, bounded retries, and failure reporting.
- Define document deletion, retention, and index invalidation behavior.
- Add upload validation, request limits, operational metrics, and deployment configuration.

Acceptance: cross-user isolation tests, worker recovery tests, deletion verification, and a reproducible deployment guide.
