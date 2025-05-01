import { basename } from "https://deno.land/std/path/mod.ts";
import { Args } from "./args.ts";
import { PromptBuilder } from "./prompt_builder.ts";
import { GitHandler } from "./git_handler.ts";

export class Core {
  private args: Args;
  private promptBuilder: PromptBuilder;
  private gitHandler: GitHandler;
  private prompt: string = "";

  constructor() {
    try {
      this.args = this.parseArgs(Deno.args);
    } catch (e) {
      console.error(`Argument parsing failed during initialization: ${e}`);
      throw new Error(
        "Failed to initialize Core due to argument parsing error.",
      );
    }
    this.promptBuilder = new PromptBuilder();
    this.gitHandler = new GitHandler();
  }

  public async start(): Promise<string> {
    try {
      this.prompt = this.args.isInstant()
        ? this.buildInstant()
        : await this.buildFull();
      return this.prompt;
    } catch (e) {
      console.error(`Error building prompt: ${e}`);
      return "";
    }
  }

  private parseArgs(args: string[]): Args {
    return new Args((args[0] === "--instant") && (args.length == 1));
  }

  private buildInstant(): string {
    return this.promptBuilder.directory(basename(Deno.cwd())).build();
  }

  private async buildFull(): Promise<string> {
    const branch = await this.gitHandler.getBranch();
    const status = await this.gitHandler.isDirtyStaging();
    return this.promptBuilder.directory(basename(Deno.cwd())).branch(branch)
      .status(status).build();
  }
}
