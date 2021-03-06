# Pull Request Linter

A GitHub Action to ensure that your PR title matches a given regex.

## Usage

Create a workflow definition at `.github/workflows/<my-workflow>.yml` with
something like the following contents:

```yaml
name: PR Lint

on:
  pull_request:
    # By default, a workflow only runs when a pull_request's activity type is opened, synchronize, or reopened. We
    # explicity override here so that PR titles are re-linted when the PR text content is edited.
    #
    # Possible values: https://help.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-event-pull_request
    types: [opened, edited, reopened]

jobs:
  pr-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: morrisoncole/pr-lint-action@v1.1.1
        with:
          title-regex: "#EX-[0-9]+"
          on-failed-title-comment:
            "This is just an example. Failed regex: `%regex%`!"
          body-regex: "foo"
          on-failed-body-comment: "The body must contain foo"
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

## Changelog

### v1.2.1

- Add support for body checks

### v1.1.1

Internal refactoring only:

- Update dependencies
- Configure ESLint & Prettier

### v1.1.0

- Replaced status checks with an automatic bot review. If the PR title fails to
  match the regex, the bot will request changes. Once the title is edited to
  match it, the bot will dismiss its review.
- Updated all dependencies.

### v1.0.0

- Initial release. This version uses action status checks but suffers from
  [#5](https://github.com/MorrisonCole/pr-lint-action/issues/5) since the GitHub
  actions API treats different hook types as separate checks by default.

## FAQ

### Why doesn't this Action use status checks any more?

Since actions
[are currently not grouped together](https://github.community/t5/GitHub-Actions/duplicate-checks-on-pull-request-event/m-p/33157),
previously failed status checks were persisted despite newer runs succeeding
(reported in [#5](https://github.com/MorrisonCole/pr-lint-action/issues/5)). We
made the decision to use a bot-based 'request changes' workflow for the time
being.

## Developing

### Build

`yarn install`

`yarn build`

Building outputs to `lib/main.js`.

## Related Reading

- [GitHub Action Metadata Syntax](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/metadata-syntax-for-github-actions)
