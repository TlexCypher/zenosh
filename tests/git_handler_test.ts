import { assertEquals } from "jsr:@std/assert";
import {
  CommandResult,
  CommandRunner,
  FileSystemChecker,
  GitHandler,
} from "../src/core/git_handler.ts";

const createMockRunner = (
  results: Array<Partial<CommandResult>>,
): CommandRunner => {
  let callIndex = 0;
  return (_cmdArgs: string[]) => {
    const result = results[callIndex] ??
      { exitCode: 1, stderr: "Mock result not defined" };
    callIndex++;
    return Promise.resolve({
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      exitCode: result.exitCode ?? 1,
    });
  };
};

const createMockFsChecker = (
  statResult: (Deno.FileInfo & { isDirectory: true }) | null,
): FileSystemChecker => ({
  stat: (_path: string) => {
    return Promise.resolve(statResult);
  },
});

Deno.test("GitHandler#getBranch", async (t) => {
  const mockFileInfo = { isDirectory: true } as
    & Deno.FileInfo
    & { isDirectory: true };

  await t.step(
    "should return branch name when in git directory and command succeeds",
    async () => {
      const mockRunner = createMockRunner([
        { stdout: "feature/test", exitCode: 0 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);

      const branch = await handler.getBranch();
      assertEquals(branch, "feature/test");
    },
  );

  await t.step(
    "should return empty string when not in git directory",
    async () => {
      const mockRunner = createMockRunner([]);
      const mockFs = createMockFsChecker(null);
      const handler = new GitHandler(mockRunner, mockFs);
      const branch = await handler.getBranch();
      assertEquals(branch, "");
    },
  );

  await t.step(
    "should return empty string when git command fails",
    async () => {
      const mockRunner = createMockRunner([
        { stderr: "fatal: not a git reference", exitCode: 128 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);

      const branch = await handler.getBranch();
      assertEquals(branch, "");
    },
  );
});

Deno.test("GitHandler#isDirtyStaging", async (t) => {
  const mockFileInfo = { isDirectory: true } as Deno.FileInfo & {
    isDirectory: true;
  };

  await t.step(
    "should return true when git status reports changes",
    async () => {
      const mockRunner = createMockRunner([
        { stdout: " M file.ts\n?? new_file.ts", exitCode: 0 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);
      assertEquals(await handler.isDirtyStaging(), true);
    },
  );

  await t.step(
    "should return false when git status reports no changes",
    async () => {
      const mockRunner = createMockRunner([
        { stdout: "", exitCode: 0 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);
      assertEquals(await handler.isDirtyStaging(), false);
    },
  );

  await t.step("should return false when not in git directory", async () => {
    const mockRunner = createMockRunner([]);
    const mockFs = createMockFsChecker(null);
    const handler = new GitHandler(mockRunner, mockFs);
    assertEquals(await handler.isDirtyStaging(), false);
  });
});

Deno.test("GitHandler#getPullRequestStatus", async (t) => {
  const mockFileInfo = { isDirectory: true } as Deno.FileInfo & {
    isDirectory: true;
  };

  await t.step(
    "should return PR status when gh is installed and PR exists",
    async () => {
      const mockRunner = createMockRunner([
        { exitCode: 0 },
        { stdout: "MERGED", exitCode: 0 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);
      assertEquals(await handler.getPullRequestStatus(), "MERGED");
    },
  );

  await t.step("should return empty string when no PR is found", async () => {
    const mockRunner = createMockRunner([
      { exitCode: 0 },
      { stderr: "no pull requests found for branch", exitCode: 1 },
    ]);
    const mockFs = createMockFsChecker(mockFileInfo);
    const handler = new GitHandler(mockRunner, mockFs);
    assertEquals(await handler.getPullRequestStatus(), "");
  });

  await t.step(
    "should return empty string when gh is not installed",
    async () => {
      const mockRunner = createMockRunner([
        { exitCode: 1 },
      ]);
      const mockFs = createMockFsChecker(mockFileInfo);
      const handler = new GitHandler(mockRunner, mockFs);
      assertEquals(await handler.getPullRequestStatus(), "");
    },
  );

  await t.step(
    "should return empty string when not in git directory",
    async () => {
      const mockRunner = createMockRunner([]);
      const mockFs = createMockFsChecker(null);
      const handler = new GitHandler(mockRunner, mockFs);
      assertEquals(await handler.getPullRequestStatus(), "");
    },
  );
});
