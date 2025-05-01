export class Colorlizer {
  private static colorlize(color: string, target: string) {
    return `%F{${color}}${target}%f`;
  }

  public static boldize(target: string) {
    return `%B${target}%b`;
  }

  public static RED(target: string) {
    return this.colorlize("9", target);
  }

  public static CYAN(target: string) {
    return this.colorlize("14", target);
  }

  public static YELLOW(target: string) {
    return this.colorlize("11", target);
  }

  public static MAGENTA(target: string) {
    return this.colorlize("12", target);
  }

  public static GREEN(target: string) {
    return this.colorlize("10", target);
  }
}
