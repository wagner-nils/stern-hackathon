"""Reads the journey PDF back: per page, the target page of every internal link and every external URL, plus the
number of bookmarks. Prints JSON for build.mjs, which compares it with the links the HTML declares.

    uv run --with pypdf python journey/build/pdfcheck.py <file.pdf>
"""
import json
import sys

from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
page_index = {page.indirect_reference.idnum: i + 1 for i, page in enumerate(reader.pages)}
named = {}
for name, dest in reader.named_destinations.items():
    try:
        named[str(name).lstrip("/")] = reader.get_destination_page_number(dest) + 1
    except Exception:
        named[str(name).lstrip("/")] = None


def target(annot):
    """The 1-based page an internal link jumps to, or ("uri", url) for an external one."""
    action = annot.get("/A")
    dest = annot.get("/Dest")
    if action is not None:
        action = action.get_object()
        if action.get("/S") == "/URI":
            return ("uri", str(action.get("/URI")))
        dest = action.get("/D")
    if dest is None:
        return None
    dest = dest.get_object() if hasattr(dest, "get_object") else dest
    if isinstance(dest, (str, bytes)) or type(dest).__name__ in ("TextStringObject", "ByteStringObject", "NameObject"):
        return named.get(str(dest).lstrip("/"))
    if isinstance(dest, list) or type(dest).__name__ == "ArrayObject":
        return page_index.get(dest[0].idnum)
    return None


pages = []
for page in reader.pages:
    internal, external = [], []
    for ref in page.get("/Annots") or []:
        annot = ref.get_object()
        if annot.get("/Subtype") != "/Link":
            continue
        t = target(annot)
        if isinstance(t, tuple):
            external.append(t[1])
        else:
            internal.append(t)
    pages.append({"internal": internal, "external": external})


def count(items):
    n = 0
    for item in items:
        n += count(item) if isinstance(item, list) else 1
    return n


print(json.dumps({"pages": pages, "bookmarks": count(reader.outline)}))
