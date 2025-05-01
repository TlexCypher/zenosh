import { basename } from "https://deno.land/std/path/mod.ts";
import { Args } from "./args.ts";
import { PromptBuilder } from "./prompt_builder.ts";

export class Core {
  private args: Args;
  private promptBuilder: PromptBuilder;
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
  }

  public start(): string {
    try {
      this.prompt = this.args.isInstant()
        ? this.buildInstant()
        : this.buildFull();
      return this.prompt;
    } catch (e) {
      console.error(`Error building prompt: ${e}`);
      return "";
    }
  }

  private parseArgs(args: string[]): Args {
    //TODO: parse instant option
    return new Args(true);
  }

  private buildInstant(): string {
    return this.promptBuilder.directory(basename(Deno.cwd())).build();
  }

  private buildFull(): string {
    return "";
  }
}

