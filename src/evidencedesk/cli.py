import argparse
import json
import sys
import urllib.error
from .core import Retriever, answer, load_chunks


def main():
    parser = argparse.ArgumentParser(description="Ask questions about local Markdown/text documents")
    parser.add_argument("question")
    parser.add_argument("--docs", default="data")
    parser.add_argument("--generate", action="store_true", help="Send retrieved text to OpenAI (incurs API costs)")
    args = parser.parse_args()
    try:
        chunks = load_chunks(args.docs)
        if not chunks:
            raise ValueError("No readable Markdown/text documents found")
        print(json.dumps(answer(Retriever(chunks), args.question, args.generate), indent=2))
    except (ValueError, OSError, urllib.error.URLError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
