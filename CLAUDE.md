# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Out and About — a side project of the Sol Design Archive (`../soldesignarchive`).
A feed of vernacular design seen on the street: each artefact is one or a few
photos, a blurb and some tags.

Its stack, archive logic and design are modelled on the main site: Jekyll 4,
Bootstrap 5.1 (CSS only), Isotope for filtering, Fancyapps Carousel and
Fancybox for photos, the same palette and fonts. Class names that do the same
job as on the main site keep their names there (`.filter-group`,
`.a-filter-label`, `.deet-label`, `.a-module`…), so fixes carry across.

## Running it

```bash
bundle exec jekyll serve -u --port 4002    # http://127.0.0.1:4002
```

The main site's environment traps apply here too: `GEM_HOME` must point at
`~/.gem/ruby/3.1.3`, and a UTF-8 locale is needed. `.claude/launch.json` sets
both. Port 4002 because the main site's preview uses 4001 and LUNA 4000.

`-u` (`--unpublished`) shows the five sample records, which are
`published: false`. A plain `bundle exec jekyll build` leaves them out, so
production shows "Nothing here yet" until real artefacts are added. Delete the
samples (records, photos and thumbnails, all `oaa-0001`…`oaa-0005`) before
adding real ones.

## The views

- **Feed** (`index.html`): fixed header; fixed left column with site info and
  tag filters; main column of artefacts, photos left and text right.
- **Grid** (`grid.html`, `/grid/`): same header and left column; main column
  is a grid of first photos linking to each artefact's page.
- **Artefact** (`_layouts/artefact.html`, `/artefacts/{slug}/`): one entry,
  with newer/older links. Its left column lists the tags as links into the feed.

Feed order is `ref_id`, newest first.

Filtering is in `js/oaa.js`. Each item carries `tag-{slug}` classes; ticked
tags show artefacts with **any** of them (OR, as within one filter group on
the main site). The selection is kept in `?tags=a,b`, which is how it
survives switching between feed and grid, and how tag links on an artefact
page land filtered.

## Adding an artefact

1. Pick the next `ref_id`.
2. Photos go in `images/`, named by ref and slug:
   `oaa-{ref_id}-{slug}.jpg`, then `oaa-{ref_id}-{slug}-2.jpg`, `-3.jpg`…
3. The record is `_artefacts/{slug}.md`. The filename **is** the slug the
   photos are found by.
4. Run `scripts/thumbs.sh` to make the grid thumbnail
   (`images/sm/oaa-{ref_id}-{slug}-sm.jpg`). Until it exists the grid falls
   back to the full photo.

```yaml
ref_id: "0006"            # quoted, four digits - leading zeros matter
title: Talho Central
date: 2026-10-03          # date added; orders the RSS feed
seen: 2026-09-14          # optional: when it was photographed
location: Mouraria, Lisbon  # optional
tags: [hand-lettering, shopfront]   # always a list
image_count: 3            # omit for a single photo
published: true
---
The blurb, in Markdown.
```

`layout: artefact` comes from the `defaults` in `_config.yml`.

Tags: lowercase and hyphenated. They are displayed with hyphens as spaces and
slugified for classes and URLs, so `Hand lettering` and `hand-lettering` would
collide. Always write `tags` as a list: Jekyll splits a bare string on
spaces.

Phone photos carry the GPS position they were taken at in their EXIF.
`thumbs.sh` strips it from thumbnails (with ImageMagick); strip the full
photos before committing them, e.g.
`magick mogrify -auto-orient -strip images/oaa-0006-*.jpg`.

## Deployment

GitHub Actions (`.github/workflows/pages.yml`), as on the main site, with
Jekyll 4.2.1 from this repo's Gemfile. `Gemfile.lock` lists `x86_64-linux` as
well as `arm64-darwin`; keep it that way (`bundle lock --add-platform x86_64-linux`).

Images are in Git LFS (`.gitattributes`), so the workflow checks out with
`lfs: true`; without it Pages would publish the pointer files.

Before the first deploy:

- set `url` in `_config.yml` and add a `CNAME`;
- add the domain to the Adobe Fonts kit `tjk6djf` (degular-mono), which only
  serves listed domains;
- check the Founders Grotesk and Tiempos web licences cover a second domain
  (the woff2 files are copied from the main site).

## Gotchas

`_site`, `.jekyll-cache` and `.jekyll-metadata` are gitignored.

`scripts/` and `CLAUDE.md` are excluded from the build in `_config.yml`.

`js/isotope.pkgd.min.js` is a copy of the main site's (Isotope 3.0.6).
