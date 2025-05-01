export class Colorlizer {
  private static colorlize(color: string, target: string) {
    return `%F{${color}}${target}%f`;
  }
  public static RED(target: string) {
    return this.colorlize("red", target);
  }

  public static CYAN(target: string) {
    return this.colorlize("cyan", target);
  }

  public static YELLOW(target: string) {
    return this.colorlize("yellow", target);
  }

  public static MAGENTA(target: string) {
    return this.colorlize("magenta", target);
  }
}
