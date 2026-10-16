# Development workflow

Follow this workflow to keep changes within the agreed scope and prepare a reviewable commit.

## Confirm the scope

1. Read the applicable project guidelines.
2. Inspect the working directory and relevant Git history before editing.
3. Identify the files and behavior needed to complete the task.
4. Preserve existing work and intentional design decisions. Report unrelated problems separately.

## Confirm design changes

1. Before changing a shared API or architecture, describe the problem and affected callers.
2. Propose a concrete change and explain whether the existing design can meet the requirement.
3. Obtain maintainer approval before implementing the change. Proceed when existing authorization explicitly covers it.
4. Update affected callers, documentation, and necessary tests together.

Treat an implementation plan as a proposal. Passing checks and preserving appearance do not replace approval.

## Keep temporary tools local

- Put one-off probes, migration checks, and debugging output outside the repository.
- When a temporary file must live inside the repository, exclude it locally. Ignore rules do not exclude tracked files.
- Confirm scope and maintenance needs before adding a development tool to version control.
- Keep machine-specific paths, cache locations, tool installation paths, personal settings, and credentials out of tracked files and commit messages.
- Do not add, edit, delete, or restore release metadata unless the maintainer explicitly authorizes that action.

## Check the commit contents

1. Inspect the changed files and untracked files.
2. Run checks appropriate to the change. Record results and anything unverified.
3. Stage files by explicit path. Avoid staging the entire working directory.
4. Inspect the complete staged diff for scope, temporary files, release metadata, and local setup details.
5. Unstage unrelated files without deleting their working-directory contents.
6. Report what changed, why it changed, the verification results, and unresolved issues.

Do not rewrite existing commit history without explicit authorization.
