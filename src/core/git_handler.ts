type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

type CommandRunner = (cmdArgs: string[]) => Promise<CommandResult>;

type FileSystemChecker = {
  stat: (
    path: string,
  ) => Promise<(Deno.FileInfo & { isDirectory: true }) | null>;
};

export const defaultDenoCommandRunner: CommandRunner = async (
  cmdArgs: string[],
): Promise<CommandResult> => {
  if (cmdArgs.length === 0) {
    console.error(
      "[Deno.Command Runner] Error: Received empty command arguments.",
    );
    return { stdout: "", stderr: "Empty command", exitCode: 1 };
  }

  try {
    const command = new Deno.Command(cmdArgs[0], {
      args: cmdArgs.slice(1),
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout, stderr } = await command.output();
    const stdoutStr = new TextDecoder().decode(stdout);
    const stderrStr = new TextDecoder().decode(stderr);

    return {
      stdout: stdoutStr,
      stderr: stderrStr,
      exitCode: code,
    };
  } catch (e) {
    console.error(
      `[Deno.Command Error] Failed to execute: ${cmdArgs.join(" ")}`,
      e,
    );
    return {
      stdout: "",
      stderr: `Failed to execute Deno.Command: ${e}`,
      exitCode: (e instanceof Deno.errors.NotFound) ? 127 : 1,
    };
  }
};

export const defaultFsChecker: FileSystemChecker = {
  stat: async (path) => {
    try {
      const fileInfo = await Deno.stat(path);
      if (fileInfo.isDirectory) {
        return { ...fileInfo, isDirectory: true };
      }
      return null;
    } catch (_) {
      return null;
    }
  },
};

export class GitHandler {
  private runner: CommandRunner;
  private fs: FileSystemChecker;

  constructor(
    runner: CommandRunner = defaultDenoCommandRunner,
    fs: FileSystemChecker = defaultFsChecker,
  ) {
    this.runner = runner;
    this.fs = fs;
  }

  private async hasGitDirectory(): Promise<boolean> {
    const fileInfo = await this.fs.stat(".git");
    return fileInfo?.isDirectory ?? false;
  }

  private async hasGithubCLI(): Promise<boolean> {
    const { exitCode } = await this.runner(["gh", "--version"]);
    return exitCode === 0;
  }

  public async isDirtyStaging(): Promise<boolean> {
    if (!await this.hasGitDirectory()) {
      return false;
    }
    const { stdout, exitCode } = await this.runner([
      "git",
      "status",
      "--porcelain",
    ]);
    if (exitCode !== 0) return false;
    const changes = stdout.trim().split("\n");
    return changes.length > 1 ||
      (changes.length === 1 && changes[0].length !== 0);
  }

  public async getBranch(): Promise<string> {
    if (!await this.hasGitDirectory()) {
      return "";
    }
    const { stdout, exitCode } = await this.runner([
      "git",
      "symbolic-ref",
      "--short",
      "HEAD",
    ]);
    if (exitCode !== 0) return "";
    return stdout.trim();
  }

  public async getPullRequestStatus(): Promise<string> {
    if (!await this.hasGitDirectory()) {
      return "";
    }
    if (!await this.hasGithubCLI()) {
      return "";
    }
    const { stdout, exitCode } = await this.runner([
      "gh",
      "pr",
      "view",
      "--json",
      "state",
      "--template",
      "{{.state}}",
    ]);
    if (exitCode !== 0) {
      return "";
    }
    const res = stdout.trim().split("\n")[0];
    return res;
  }
}
