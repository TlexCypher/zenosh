import { Colorlizer } from "./colorlizer.ts";

export class PromptBuilder {
  private prompt: string = "";
  private currentDirectory: string = "";
  private gitBranch: string = "";
  private gitStatus: string = "";
  private prStatus: string = "";

  public build(): string {
    this.prompt = `${this.currentDirectory} `;
    if (this.gitBranch.length > 0) {
      this.prompt += `${this.gitBranch} `;
    }
    if (this.gitStatus.length > 0) {
      this.prompt += `${this.gitStatus} `;
    }
    if (this.prStatus.length > 0) {
      this.prompt += `${this.prStatus} `;
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
    if (branch.length == 0) return this;
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

  public pr(status: string): PromptBuilder {
    if (status.length > 0) {
      this.prStatus = `${Colorlizer.MAGENTA(`(`)}${
        Colorlizer.CYAN(`PR:${status}`)
      }${Colorlizer.MAGENTA(`)`)}`;
    }
    return this;
  }
}
