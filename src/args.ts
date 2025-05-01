export class Args {
  private instant: boolean;

  constructor(isInstant: boolean) {
    this.instant = isInstant;
  }

  isInstant(): boolean {
    return this.instant;
  }
}
