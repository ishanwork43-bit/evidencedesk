"""Small smoke benchmark, not evidence of real-world quality."""
import json
from .core import Retriever, load_chunks

CASES = [
    ("What does ACID stand for?", "transactions.md"),
    ("Why use chunk overlap in retrieval?", "retrieval.md"),
    ("How does TTL expire cache entries?", "caching.md"),
    ("Who won the football world cup?", None),
]


def main():
    retriever = Retriever(load_chunks("data"))
    correct = 0
    for query, expected in CASES:
        hits = retriever.search(query, k=1)
        actual = hits[0][1].source if hits else None
        correct += actual == expected
    print(json.dumps({"cases": len(CASES), "top1_or_abstention_accuracy": correct / len(CASES),
                      "scope": "Synthetic smoke benchmark; does not evaluate generated answers"}, indent=2))
    return 0 if correct == len(CASES) else 1


if __name__ == "__main__":
    raise SystemExit(main())
