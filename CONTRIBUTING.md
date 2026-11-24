# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Create a branch from `develop` (e.g. `fix/signin-issue`, `feature/issue-templates`) and open the PR against `develop`.
2. Use a [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) PR title, e.g. `fix(auth): refresh expiring tokens`. The `PR Title` check enforces this.
3. Make sure `yarn test`, `yarn lint` and `yarn build` pass.
4. PRs are **squash-merged** with the PR title as the commit message, once approved by the code owner.
5. Do **not** bump the version in `package.json` yourself. It is decided at release time (see below).

## Versioning and Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please) and follow [SemVer](https://semver.org/).

```
feature PR --squash--> develop --> release-please keeps a release PR up to date
                                   (package.json version + CHANGELOG.md)
                                        | merge the release PR
                                        v
                       tag vX.Y.Z + GitHub Release
                                        |
                                        v
                       main is fast-forwarded --> Vercel production deploy
```

- `main` only tracks the latest release. Never commit or open PRs to `main` directly.
- The next version is computed from the commits merged since the last release, so it is fine if a change turns out bigger than expected: the release PR is recalculated on every push to `develop`.

### Which PR title type to use

Phonograph is an app, not a library, so "breaking" means something users have to act on.

| Change                                                                                                  | Title example                                  | Release    |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------- |
| Users must act or lose something: re-authorization / new Spotify scopes, removed features, changed URLs | `feat!: require playlist-read scope`           | major      |
| New user-visible feature                                                                                | `feat: add playlist shuffle`                   | minor      |
| Bug fix, performance improvement, production dependency fix                                             | `fix: ...`, `perf: ...`, `fix(deps): ...`      | patch      |
| Tests, docs, CI, refactoring, dev dependencies                                                          | `test:`, `docs:`, `ci:`, `refactor:`, `chore:` | no release |

### Overriding the version

To force a specific version, set `"release-as": "x.y.z"` for the `.` package in `release-please-config.json`, merge that change, then remove it after the release.

### Maintainer setup

The workflow needs a fine-grained personal access token from a repository admin stored as the `RELEASE_TOKEN` secret, with access to this repository only and these permissions:

- Contents: Read and write
- Pull requests: Read and write
- Workflows: Read and write (main is fast-forwarded over commits that may change workflow files)

The token lets the release PR trigger CI and lets the workflow update the protected `main` branch. Renew it before it expires.

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at [INSERT EMAIL ADDRESS]. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
