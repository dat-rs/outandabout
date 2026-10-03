#!/usr/bin/env bash
# Makes the grid thumbnail for each artefact that lacks one (or whose first
# photo has changed since):
#
#   images/oaa-{ref_id}-{slug}.jpg  ->  images/sm/oaa-{ref_id}-{slug}-sm.jpg
#
# Only the first photo gets one; the grid shows nothing else. Works from
# the records rather than the image filenames, because a slug can end in
# a number and look like a "-2" photo.
#
# ImageMagick's -strip drops EXIF, including the GPS position phones write
# into photos. sips (the fallback) keeps it.

set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p images/sm

for record in _artefacts/*.md; do
  slug=$(basename "$record" .md)
  ref_id=$(grep -m1 '^ref_id:' "$record" | tr -dc '0-9')
  src="images/oaa-$ref_id-$slug.jpg"
  dst="images/sm/oaa-$ref_id-$slug-sm.jpg"

  if [[ ! -f $src ]]; then
    echo "missing photo: $src ($record)" >&2
    continue
  fi
  [[ -f $dst && $dst -nt $src ]] && continue

  if command -v magick >/dev/null; then
    magick "$src" -auto-orient -strip -resize '800x800>' -quality 82 "$dst"
  else
    sips -Z 800 "$src" --out "$dst" >/dev/null
  fi
  echo "made $dst"
done
