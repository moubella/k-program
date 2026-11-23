#!/usr/bin/env python3
"""Widens an image to a target width by extending its left and right edges.

Used when the two panels of an illustration sheet differ in width: the app lays
the end frame exactly over the start frame, so both must share one shape. The
illustrations have a plain wall and floor at their edges, so the stretch is
invisible. Each padding row is the edge band's average colour, lightly smoothed
vertically, so single-pixel noise does not turn into streaks. Works on the
uncompressed 24-bit BMP that macOS sips writes.
Usage: pad-edges.py <in.bmp> <out.bmp> <target-width>
"""
import struct
import sys

BAND = 12  # columns averaged at each edge (labels start ~19 px in)
SMOOTH = 1  # rows averaged above and below


def edge_colours(data, offset, stride, rows, first, last):
    raw = []
    for y in range(rows):
        start = offset + y * stride
        sums = [0, 0, 0]
        for x in range(first, last):
            for c in range(3):
                sums[c] += data[start + x * 3 + c]
        raw.append([v / (last - first) for v in sums])
    colours = []
    for y in range(rows):
        window = raw[max(0, y - SMOOTH):y + SMOOTH + 1]
        colours.append(bytes(round(sum(p[c] for p in window) / len(window)) for c in range(3)))
    return colours


def main(src, dst, target):
    data = open(src, "rb").read()
    offset = struct.unpack_from("<I", data, 10)[0]
    width, height = struct.unpack_from("<ii", data, 18)
    bits = struct.unpack_from("<H", data, 28)[0]
    if bits != 24:
        sys.exit(f"{src}: expected a 24-bit BMP, got {bits}-bit")
    rows = abs(height)
    stride = (width * 3 + 3) & ~3
    left = (target - width) // 2
    right = target - width - left
    out_stride = (target * 3 + 3) & ~3
    lefts = edge_colours(data, offset, stride, rows, 0, BAND)
    rights = edge_colours(data, offset, stride, rows, width - BAND, width)
    body = bytearray()
    for y in range(rows):
        row = data[offset + y * stride:offset + y * stride + width * 3]
        line = lefts[y] * left + row + rights[y] * right
        body += line + b"\0" * (out_stride - len(line))
    header = bytearray(data[:offset])
    struct.pack_into("<I", header, 2, offset + len(body))
    struct.pack_into("<i", header, 18, target)
    struct.pack_into("<I", header, 34, len(body))
    open(dst, "wb").write(bytes(header) + bytes(body))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
