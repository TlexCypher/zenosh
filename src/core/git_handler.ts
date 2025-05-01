import { $ } from "zx";

export class GitHandler {
  private async hasGitDirectory(): Promise<boolean> {
    try {
      const fileInfo = await Deno.stat(".git");
      return fileInfo.isDirectory;
    } catch (_) {
      return false;
    }
  }

  private async hasGithubCLI(): Promise<boolean> {
    try {
      const { exitCode } = await $`gh status`.quiet().nothrow();
      if (exitCode !== 0) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  public async isDirtyStaging(): Promise<boolean> {
    if (!await this.hasGitDirectory()) {
      return false;
    }
    const { stdout, exitCode } = await $`git status --porcelain`.quiet()
      .nothrow();
    if (exitCode !== 0) return false;
    const changes = stdout.trim().split("\n");
    return changes.length > 1 ||
      (changes.length == 1 && changes[0].length != 0);
  }

  public async getBranch(): Promise<string> {
    if (!await this.hasGitDirectory()) {
      return "";
    }
    try {
      const { stdout, exitCode } = await $`git symbolic-ref --short HEAD`
        .quiet().nothrow();
      if (exitCode !== 0) return "";
      return stdout.trim();
    } catch (_) {
      return "";
    }
  }

  public async getPullRequestStatus(): Promise<string> {
    if (!await this.hasGitDirectory()) {
      return "";
    }
    if (!await this.hasGithubCLI()) {
      return "";
    }
    const { stdout, exitCode } =
      await $`gh pr view --json state --template '{{.state}}'`.quiet()
        .nothrow();
    if (exitCode !== 0) {
      return "";
    }
    const res = stdout.trim().split("\n")[0];
    return res;
  }
}
