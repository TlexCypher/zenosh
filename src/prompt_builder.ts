import { Colorlizer } from "./colorlizer.ts";

export class PromptBuilder {
  private prompt: string = "";
  private currentDirectory: string = "";
  private gitBranch: string = "";
  private gitStatus: string = "";

  public build(): string {
    this.prompt =
      `${this.currentDirectory} ${this.gitBranch} ${this.gitStatus}`;
    return this.prompt;
  }

  public directory(directory: string): PromptBuilder {
    this.currentDirectory = Colorlizer.CYAN(directory);
    return this;
  }

  public branch(branch: string): PromptBuilder {
    this.gitBranch = `${Colorlizer.YELLOW("(")}${Colorlizer.MAGENTA(branch)}${
      Colorlizer.YELLOW(")")
    }`;
    return this;
  }

  public status(status: boolean): PromptBuilder {
    if (status) {
      this.gitStatus = `${Colorlizer.YELLOW("✘")}`;
    }
    return this;
  }
}
