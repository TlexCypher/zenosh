import { Colorlizer } from "./colorlizer.ts";

export class PromptBuilder {
  private prompt: string = "";
  private currentDirectory: string = "";
  private gitBranch: string = "";
  private gitStatus: string = "";

  public build(): string {
    this.prompt = `${this.currentDirectory} `;
    if (this.gitBranch.length > 0) {
      this.prompt += `${this.gitBranch} `;
    }
    if (this.gitStatus.length > 0) {
      this.prompt += `${this.gitStatus} `;
    }
    return this.prompt;
  }

  public directory(directory: string): PromptBuilder {
    this.currentDirectory = Colorlizer.boldize(
      `${Colorlizer.GREEN("▶︎")} ${Colorlizer.CYAN(directory)}`,
    );
    return this;
  }

  public branch(branch: string): PromptBuilder {
    this.gitBranch = Colorlizer.boldize(
      `${Colorlizer.MAGENTA("git:(")}${Colorlizer.RED(branch)}${
        Colorlizer.MAGENTA(")")
      }`,
    );
    return this;
  }

  public status(status: boolean): PromptBuilder {
    if (status) {
      this.gitStatus = `${Colorlizer.YELLOW("✘")}`;
    }
    return this;
  }
}
