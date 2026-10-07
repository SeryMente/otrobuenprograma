# Blog · Ser y Mente / OGP

Canonical OGP repository: https://github.com/SeryMente/otrogranprograma

Source project recovered from: https://github.com/SeryMente/serymente

Cloud development runtime: WordPress Playground
Canonical upstream: https://github.com/WordPress/wordpress-playground

## Zero-cost development path

This implementation uses WordPress Playground so that WordPress runs in the browser without a paid server. The Blueprint installs a small classic theme and the recovered Ser y Mente blog module, then creates a deterministic set of placeholder posts and a Blog page.

The exported Playground ZIP can later be restored to a conventional WordPress + PHP + MySQL installation.

## Fidelity boundary

The repository contains the custom Ser y Mente code, including the dynamic blog module and its CSS. It does not contain the historical WordPress database, uploads/media library, or the proprietary Divi theme package. Therefore this branch reproduces the recovered blog module and layout faithfully from available source code, but does not claim a pixel-identical reconstruction of the entire historical site until those missing assets are recovered.

## Entry point

After this branch is merged into the OGP Pages deployment:

https://serymente.github.io/otrogranprograma/blog/

That page opens the prepared WordPress Playground environment.

## Files

- index.html — OGP blog entry point.
- playground/blueprint.json — deterministic Playground setup.
- playground/theme/ — minimal classic theme shell.
- playground/plugin/ — recovered Ser y Mente blog module plus source-faithful CSS.
- playground/*.zip — installable theme/plugin and complete Blueprint bundle.
