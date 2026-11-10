# Engineering decisions

## Why start with lexical retrieval?

It runs without credentials, has transparent scoring and creates a baseline against which semantic models can be evaluated. A neural model should earn its complexity through measured improvement. This baseline is unsuitable for large document collections because it keeps vectors in memory and rebuilds the index for each question.

## Why separate extraction from generation?

Retrieval failures and generation failures need separate measurements. Extractive mode makes the retrieved evidence visible. Generated mode adds summarization but introduces unsupported statements, invalid citations, network failures, provider cost and data handling concerns. The current retrieval threshold only checks lexical similarity; it cannot establish that a question is answerable.

## What to implement before deployment

Use an API framework with request schemas and size limits; authenticated, tenant-scoped storage and retrieval; upload validation; background ingestion; deletion semantics; secrets management; timeouts and rate limits. Treat filenames and document content as untrusted. Do not add tool execution to a document assistant without an explicit authorization design. Log operational metadata instead of raw private document text. Define retention and deletion policies.

## Experiments to run

Compare chunk sizes, overlap, lexical retrieval, dense retrieval, hybrid fusion and reranking using identical evaluation questions. Save model/version, dataset hash, configuration, hardware and raw results. Tune on development data, then evaluate once on held-out data. Include paraphrases, conflicting documents, adversarial instructions and unanswerable questions. Manually verify a sample of generated answers and citations; an LLM judge alone is not ground truth.

## Open design questions

- How should the retrieval threshold vary across document collections?
- Which chunking strategy preserves context without adding excessive noise?
- How should index versions track embedding model and document revisions?
- Where should tenant isolation be enforced across ingestion and retrieval?
- Which measurements justify adding a reranker or persistent vector store?
