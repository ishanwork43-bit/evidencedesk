import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from evidencedesk.core import Chunk, Retriever, answer, load_chunks


class CoreTests(unittest.TestCase):
    def setUp(self):
        self.r = Retriever([Chunk('a:0', 'a.md', 'Atomicity commits all operations together.'),
                            Chunk('b:0', 'b.md', 'Cache TTL expires stale entries.')])

    def test_retrieves_expected_source(self):
        self.assertEqual(self.r.search('atomicity')[0][1].source, 'a.md')

    def test_unrelated_question_abstains(self):
        self.assertEqual(answer(self.r, 'planet Jupiter')['mode'], 'abstain')

    def test_empty_index(self):
        self.assertEqual(Retriever([]).search('cache'), [])

    def test_citation_preserves_source(self):
        result = answer(self.r, 'TTL')
        self.assertEqual(result['citations'][0]['id'], 'b:0')
        self.assertIn('[1]', result['answer'])

    def test_invalid_question(self):
        for question in ['', ' ', 'a' * 2001]:
            with self.assertRaises(ValueError):
                answer(self.r, question)

    def test_chunk_overlap_and_boundaries(self):
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, 'doc.md').write_text('one two three four five six seven')
            chunks = load_chunks(directory, size=4, overlap=1)
            self.assertEqual([c.text for c in chunks], ['one two three four', 'four five six seven'])
            with self.assertRaises(ValueError):
                load_chunks(directory, size=4, overlap=4)

    def test_missing_key(self):
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaisesRegex(ValueError, 'OPENAI_API_KEY'):
                answer(self.r, 'TTL', generate=True)

    def test_generation_request_mocked(self):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = json.dumps(
            {'choices': [{'message': {'content': 'TTL expires entries [1].'}}]}).encode()
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'test-only'}), patch(
                'urllib.request.urlopen', return_value=response) as call:
            result = answer(self.r, 'TTL', generate=True)
            payload = json.loads(call.call_args.args[0].data)
            self.assertIn('untrusted data', payload['messages'][0]['content'])
            self.assertEqual(result['mode'], 'generated')
            self.assertIn('[1]', result['answer'])


if __name__ == '__main__':
    unittest.main()
