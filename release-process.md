# Augury Release Process
Document contains detailed description of Augury release process from merging to master, creating tags and publishing to chrome store.

## All HEADs must pass Continuous Integration (CI)

* Branches must always build and pass tests. Along with Pull Request against them.

## Release Types

* **Main** - a release (typically from master) with version tag `X.Y.Z` where Z is zero (e.g. `2.1.0`)
* **Hotfix** - a bugfix release (typically from a branch forked from main) with version tag `X.Y.Z` where Z is non-zero (e.g `2.1.1`) Once done hotfix should be merged to main and dev both.

## Release Steps

#### Update CHANGELOG.md

* Checkout the branch from which you wish to release (e.g. `master`).
* Choose a version tag (see above) henceforth referred to as `$TAG`.
* Add a changelog entry for the new tag at the top of `CHANGELOG.md`.
  The first line must be a markdown header of the form `## Release ${TAG#}`.
* [Changelog Template](changelog-template.md)

#### Update manifest.json, package.json, and popup.html

* Checkout the branch from which you wish to release (i.e. `master`)
* Choose a version tag (see above) henceforth referred to as `$TAG`.
* Update the version number in `manifest.json`, `package.json`, and `popup.html`

#### Commit & Push the updates:

```sh
git commit -m "Add release $TAG" CHANGELOG.md manifest.json package.json
git push
```

#### Create Version Tag

Next you must tag the changelog commit with `$TAG`

```sh
git tag -a -m "Release $TAG" $TAG
```

#### Create Build Packages

Create the release build using build script

```sh
npm run pack
```

#### Push to Chrome Store & Firefox Add-ons

* Upload the latest build file `augury.chrome.zip` to the Chrome Store and add changelog additions.
* Upload the latest build file `augury.firefox.zip` to Firefox Add-ons Developer Hub and add changelog additions.

## Post Release

* Download and install latest build from chrome store.
* Perform sanity checks on the build by checking it against any Angular application
