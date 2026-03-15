# Deployment Plan: Online Quiz System to GitHub

The goal is to deploy the React-based Online Quiz System to GitHub Pages using the existing GitHub Actions workflow.

## User Review Required

> [!IMPORTANT]
> The `frontend` directory currently contains its own `.git` folder. This can cause issues with the main repository tracking its files. I will merge the histories by removing the nested `.git` folder so that all files are tracked and deployed correctly.

## Proposed Changes

### [Git Repository Structure]

- **Remove Nested Git Repo**: Remove `frontend/.git` so that the root repostiory can track all files inside the `frontend` folder.
- **Stage and Commit**: Add all files in `frontend` to the root repository's index and commit.
- **Push to GitHub**: Push the `master` branch of the root repository to `origin`.

### [GitHub Actions]

- **Trigger Deployment**: The push will trigger the existing `.github/workflows/deploy.yml` which builds the project and deploys it to the `gh-pages` branch.

## Verification Plan

### Manual Verification
- Monitor the "Actions" tab on GitHub for the build status.
- Visit `https://vikash-kumar-singh1010.github.io/Online_Quiz_System` once the action completes.
