import assert from "node:assert";
import { describe, it } from "node:test";
import { err, ok, unwrap } from "./index.ts";

function noTens(i: number) {
	if (i % 10 !== 0) {
		return ok(i % 10);
	} else {
		return err("Divisible by 10");
	}
}

describe("ok", () => {
	it("works with basic types", () => {
		const res = ok(5);

		assert.ok(res.ok);
		assert.equal(res.value, 5);
	});
});

describe("err", () => {
	it("works with basic types", () => {
		const res = err(12);

		assert.ok(!res.ok);
		assert.equal(res.err, 12);
	});
});

describe("unwrap", () => {
	it("throws when error", () => {
		const res = noTens(10);
		assert.throws(() => unwrap(res));
	});

	it("doesn't throw when not an error", () => {
		const res = noTens(12);
		assert.ok(res.ok);
	});
});
