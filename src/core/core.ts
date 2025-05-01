import { basename } from "https://deno.land/std/path/mod.ts";
import { Args } from "./args.ts";
import { PromptBuilder } from "./prompt_builder.ts";
import {
  defaultDenoCommandRunner,
  defaultFsChecker,
  GitHandler,
} from "./git_handler.ts";

export class Core {
  private args: Args;
  private promptBuilder: PromptBuilder;
  private gitHandler: GitHandler;
  private prompt: string = "";

  constructor() {
    this.args = this.parseArgs(Deno.args);
    this.promptBuilder = new PromptBuilder();
    this.gitHandler = new GitHandler(defaultDenoCommandRunner, defaultFsChecker);
  }

  public async start(): Promise<string> {
    this.prompt = this.args.isInstant()
      ? await this.buildInstant()
      : await this.buildFull();
    return this.prompt;
  }

  private parseArgs(args: string[]): Args {
    return new Args((args[0] === "--instant") && (args.length == 1));
  }

  private async buildInstant(): Promise<string> {
    const branchPromise = this.gitHandler.getBranch();
    const [branch] = await Promise.all([branchPromise]);
    return this.promptBuilder.directory(basename(Deno.cwd())).branch(branch)
      .build();
  }

  private async buildFull(): Promise<string> {
    const prStatusPromise = this.gitHandler.getPullRequestStatus();
    const branchPromise = this.gitHandler.getBranch();
    const statusPromise = this.gitHandler.isDirtyStaging();
    const cwdPromise = Promise.resolve(Deno.cwd());
    const [prStatus, branch, isDirty, cwd] = await Promise.all([
      prStatusPromise,
      branchPromise,
      statusPromise,
      cwdPromise,
    ]);
    return this.promptBuilder.directory(basename(cwd)).branch(branch).pr(
      prStatus,
    ).status(
      isDirty,
    ).build();
  }
}
