# Augury Release Process
Document contains detailed description of Augury release process from merging to master, creating tags and publishing to chrome store.

## Types of branches
- **master**: Always contains the code for the latest main release. Code from `dev` branch must be merged into master before release.
- **dev**: Contains the code for the latest dev build. All development must occur in this branch and pushed to `master` before release.

## All HEADs must pass Continuous Integration (CI)

* Both dev and master must always build and pass tests. Along with Pull Request against them.

## Release Types

* **Main** - a release (typically from master) with version tag `vX.Y.Z` where Z is zero (e.g. `v2.1.0`)
* **Hotfix** - a bugfix release (typically from a branch forked from main) with version tag `vX.Y.Z` where Z is non-zero (e.g `v2.1.1`) Once done hotfix should be merged to main and dev both.

## Release Steps

#### Update CHANGELOG.md

* Checkout the `dev` branch from which you wish to release
* Choose a version tag (see above) henceforth referred to as `$TAG`.
* Add a changelog entry for the new tag at the top of `CHANGELOG.md`.
  The first line must be a markdown header of the form `## Release ${TAG#v}`.
* [Changelog Template](changelog-template.md)

#### Update manifest.json, package.json, and popup.html

* Checkout the `dev` branch from which you wish to release
* Choose a version tag (see above) henceforth referred to as `$TAG`.
* Update the version number in `manifest.json`, `package.json`, and `popup.html`

#### Commit & Push the updates:

    git commit -m "Add release $TAG" CHANGELOG.md manifest.json package.json
    git push

#### Create Version Tag

Next you must tag the changelog commit with `$TAG`

    git tag -a -m "Release $TAG" $TAG

#### Merge Dev

Next merge the `dev` branch to `master` branch so `master` has the code for release

#### Create Build

Create the release build using build script

    bash crxmake.sh

#### Push to Chrome Store

Upload the latest build file `batarangle.crx` to Chrome Store and update version numbers on the extension.


## Post Release

* Download and install latest build from chrome store.
* Perform sanity checks on the build by checking it against any Angular application
