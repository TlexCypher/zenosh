import { $ } from "zx";

export class GitHandler {
  public async isDirtyStaging(): Promise<boolean> {
    const { stdout, exitCode } = await $`git status --porcelain`.quiet();
    if (exitCode !== 0) return false;
    console.log(stdout.trim().split("\n"));
    return stdout.trim().split("\n").length > 0;
  }

  public async getBranch(): Promise<string> {
    try {
      const { stdout, exitCode } = await $`git symbolic-ref --short HEAD`
        .quiet();
      if (exitCode !== 0) return "";
      return stdout.trim();
    } catch (e) {
      return "";
    }
  }
}
