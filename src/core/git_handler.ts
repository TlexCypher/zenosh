import { $ } from "zx";

export class GitHandler {
  async hasGitDirectory(): Promise<boolean> {
    try {
      const fileInfo = await Deno.stat(".git");
      return fileInfo.isDirectory;
    } catch (_) {
      return false;
    }
  }

  public async isDirtyStaging(): Promise<boolean> {
    if (!await this.hasGitDirectory()) {
      return false;
    }
    const { stdout, exitCode } = await $`git status --porcelain`.quiet();
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
        .quiet();
      if (exitCode !== 0) return "";
      return stdout.trim();
    } catch (_) {
      return "";
    }
  }
}
