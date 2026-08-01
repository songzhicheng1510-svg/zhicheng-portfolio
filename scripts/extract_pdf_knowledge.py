"""Extract public, searchable text chunks from the supplied project PDF."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


PROJECT_RANGES = (
    (1, 23, "EditPanorama"),
    (24, 28, "AI-Driven Street-View Video Generation"),
    (29, 38, "AI Multi-Agent Preliminary Planning"),
    (39, 47, "Multimodal AI Agents for Urban Renewal"),
    (48, 72, "AI-Assisted Architectural Image Analysis and Generation"),
    (73, 78, "AI-Assisted Design and Analytical Diagramming"),
    (79, 81, "Text to Massing"),
    (82, 85, "Voice-Aided Rhino Modeling"),
)


def project_for_page(page: int) -> str:
    for start, end, title in PROJECT_RANGES:
        if start <= page <= end:
            return title
    return "AI Project Portfolio"


def clean_text(value: str) -> str:
    value = value.replace("\u0000", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def split_text(value: str, limit: int = 900, overlap: int = 100) -> list[str]:
    if len(value) <= limit:
        return [value]
    chunks: list[str] = []
    cursor = 0
    while cursor < len(value):
        end = min(len(value), cursor + limit)
        if end < len(value):
            boundary = max(value.rfind(". ", cursor, end), value.rfind("。", cursor, end))
            if boundary > cursor + limit // 2:
                end = boundary + 1
        chunks.append(value[cursor:end].strip())
        if end >= len(value):
            break
        cursor = max(cursor + 1, end - overlap)
    return [chunk for chunk in chunks if len(chunk) >= 40]


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_pdf_knowledge.py <input.pdf> <output.json>")

    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    records: list[dict[str, object]] = []

    with pdfplumber.open(input_path) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            text = clean_text(page.extract_text() or "")
            if len(text) < 40:
                continue
            project = project_for_page(page_index)
            for part_index, chunk in enumerate(split_text(text), start=1):
                records.append(
                    {
                        "id": f"pdf-{page_index:02d}-{part_index}",
                        "title": project,
                        "text": chunk,
                        "keywords": [project, "AI", "architecture", "portfolio"],
                        "source": "AI project portfolio PDF",
                        "page": page_index,
                        "href": None,
                    }
                )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(records)} searchable chunks to {output_path}")


if __name__ == "__main__":
    main()
