import assert from "node:assert";
import { describe, it } from "node:test";
import { chain } from "./chain.ts";
import { err, ok, type Result } from "./index.ts";

function hello(name: string) {
	return `Hello ${name}`;
}

function errCause(cause: string) {
	return `It broke because: ${cause}`;
}

describe("map", () => {
	it("handles OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = chain(res).map(hello);

		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Hello Alan");
	});

	it("handles Err", () => {
		const res = err("It broke") as Result<string, string>;

		const mapped = chain(res).map(hello);

		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke");
	});
});

describe("mapErr", () => {
	it("handles OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = chain(res).mapErr(errCause);
		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Alan");
	});

	it("handles Err", () => {
		const res = err("a crash");

		const mapped = chain(res).mapErr(errCause);
		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke because: a crash");
	});
});
