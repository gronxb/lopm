const spy = jest.spyOn(process, "cwd");
spy.mockReturnValue("__fixtures__/pnpm-packages");

describe("package.json", () => {
  console.log(process.cwd());

  it("returns the expected contents", () => {});
});
