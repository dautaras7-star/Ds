#!/usr/bin/env python3
"""Check export geometry only; identity, voice and frame composition need review.

Usage: verify_portrait.py final.mp4 [--ffprobe /path/to/ffprobe]
   or: verify_portrait.py --probe-json final.ffprobe.json
FFprobe report: ffprobe -v error -show_streams -show_format -of json final.mp4
Exit 0 = geometry passes; 1 = geometry fails; 2 = probe/input error.
"""
import argparse
from fractions import Fraction
import json
import math
from pathlib import Path
import subprocess
import sys


def ratio(value):
    if value in (None, "", "N/A", "unknown", "0:1", "0/1"):
        return None
    result = Fraction(str(value).replace(":", "/"))
    if result <= 0:
        raise ValueError("Aspect ratios must be positive")
    return result


def inspect_probe(probe):
    streams = [s for s in probe.get("streams", [])
               if s.get("codec_type") == "video"
               and not s.get("disposition", {}).get("attached_pic", 0)]
    if len(streams) != 1:
        return {"status": "fail", "geometry_only": True,
                "reason": "Expected exactly one playable video stream",
                "video_stream_count": len(streams)}
    stream = streams[0]
    width, height = int(stream["width"]), int(stream["height"])
    if width <= 0 or height <= 0:
        raise ValueError("Invalid raster dimensions")
    raster_ratio = Fraction(width, height)
    declared_dar = ratio(stream.get("display_aspect_ratio"))
    sar = ratio(stream.get("sample_aspect_ratio"))
    assumptions = []
    if sar is None:
        if declared_dar is not None:
            sar = declared_dar / raster_ratio
        else:
            sar = Fraction(1)
            assumptions.append("Unspecified pixel aspect treated as square pixels")
    raw_rotation = stream.get("tags", {}).get("rotate", 0)
    for data in stream.get("side_data_list", []):
        if "rotation" in data:
            raw_rotation = data["rotation"]
            break
    rotation = float(raw_rotation) % 360
    if not math.isfinite(rotation):
        raise ValueError("Invalid rotation")
    unrotated_dar = raster_ratio * sar
    display_ratio = (1 / unrotated_dar
                     if abs(rotation - 90) < 0.001 or abs(rotation - 270) < 0.001
                     else unrotated_dar)
    checks = {
        "portrait_raster_9_16": raster_ratio == Fraction(9, 16),
        "square_pixels": sar == 1,
        "rotation_normalized": min(rotation, 360 - rotation) < 0.001,
        "display_ratio_9_16": display_ratio == Fraction(9, 16),
        "aspect_metadata_consistent": declared_dar is None or declared_dar == unrotated_dar,
    }
    return {
        "status": "pass" if all(checks.values()) else "fail",
        "geometry_only": True,
        "width": width, "height": height,
        "sample_aspect_ratio": str(sar), "rotation_degrees": rotation,
        "display_aspect_ratio": str(display_ratio), "checks": checks,
        "assumptions": assumptions,
        "manual_checks_still_required": [
            "Full-frame single portrait composition; no baked side panels or letterboxing",
            "Same requested avatar across every view, occlusion and final frame",
            "Requested audible voice and synchronization throughout the final video",
            "Product, text, location, cuts and duration match the brief",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", nargs="?")
    parser.add_argument("--probe-json", type=Path)
    parser.add_argument("--ffprobe", default="ffprobe")
    args = parser.parse_args()
    if bool(args.video) == bool(args.probe_json):
        parser.error("Supply a video path OR --probe-json, not both")
    try:
        if args.probe_json:
            probe = json.loads(args.probe_json.read_text())
        else:
            result = subprocess.run(
                [args.ffprobe, "-v", "error", "-show_streams", "-show_format",
                 "-of", "json", args.video], capture_output=True, text=True,
                check=True, timeout=60,
            )
            probe = json.loads(result.stdout)
        report = inspect_probe(probe)
    except (OSError, ValueError, TypeError, KeyError, ZeroDivisionError,
            AttributeError, subprocess.SubprocessError) as error:
        print(json.dumps({"status": "error", "geometry_only": True,
                          "reason": str(error)}, indent=2))
        return 2
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
