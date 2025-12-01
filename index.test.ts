import assert from "node:assert";
import { describe, it } from "node:test";
import { err, isErr, isOK, ok } from "./index.ts";

describe("ok / isOK", () => {
	it("works with basic types", () => {
		const val = ok(5);

		assert.ok(isOK(val));
		assert.ok(!isErr(val));
	});
});

describe("err / isErr", () => {
	it("works with basic types", () => {
		const val = err(12);

		assert.ok(isErr(val));
		assert.ok(!isOK(val));
	});
});
