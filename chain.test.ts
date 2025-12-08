import assert from "node:assert";
import { describe, it } from "node:test";
import { chain } from "./chain.ts";
import { err, ok, type Result } from "./index.ts";

describe("inspect", () => {
	it("calls the fn and passes on the result", () => {
		let called = false;

		chain(ok("Testing")).inspect((r) => {
			assert.ok(r.ok);
			called = true;
		});

		assert.ok(called);
	});
});

describe("inspectAsync", () => {
	it("calls the fn and passes the result", async () => {
		let called = false;

		chain(ok("Testing")).inspectAsync(async (r) => {
			assert.ok(r.ok);
			called = true;
		});

		assert.ok(called);
	});
});

describe("map", () => {
	it("handles OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = chain(res)
			.map((name: string) => `Hello ${name}`)
			.result();

		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Hello Alan");
	});

	it("ignores Err", () => {
		const res = err("It broke") as Result<string, string>;

		const mapped = chain(res)
			.map((name: string) => `Hello ${name}`)
			.result();

		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke");
	});
});

describe("mapAsync", () => {
	it("handles OK", async () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = await chain(res)
			.mapAsync(async (name: string) => `Hello ${name}`)
			.result();

		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Hello Alan");
	});

	it("ignores Err", async () => {
		const res = err("It broke") as Result<string, string>;

		const mapped = await chain(res)
			.mapAsync(async (name: string) => `Hello ${name}`)
			.result();

		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke");
	});
});

describe("mapErr", () => {
	it("ignores OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = chain(res)
			.mapErr((cause: string) => `It broke because ${cause}`)
			.result();

		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Alan");
	});

	it("handles Err", () => {
		const res = err("a crash");

		const mapped = chain(res)
			.mapErr((cause: string) => `It broke because ${cause}`)
			.result();

		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke because a crash");
	});
});

describe("mapErrAsync", () => {
	it("ignores OK", async () => {
		const res = ok("Alan") as Result<string, string>;

		const mapped = await chain(res)
			.mapErrAsync(async (cause: string) => `It broke because ${cause}`)
			.result();

		assert.ok(mapped.ok);
		assert.equal(mapped.value, "Alan");
	});

	it("handles Err", async () => {
		const res = err("a crash");

		const mapped = await chain(res)
			.mapErrAsync(async (cause: string) => `It broke because ${cause}`)
			.result();

		assert.ok(!mapped.ok);
		assert.equal(mapped.err, "It broke because a crash");
	});
});

describe("andThen", () => {
	it("handles OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const andThenned = chain(res)
			.andThen((r) => ok(`Hello ${r.value}`))
			.result();

		assert.ok(andThenned.ok);
		assert.equal(andThenned.value, "Hello Alan");
	});

	it("ignores Err", () => {
		const res = err("Ugh") as Result<string, string>;

		const andThenned = chain(res)
			.andThen((r) => ok(`Hello ${r.value}`))
			.result();

		assert.ok(!andThenned.ok);
		assert.equal(andThenned.err, "Ugh");
	});
});

describe("andThenAsync", () => {
	it("handles OK", async () => {
		const res = ok("Alan") as Result<string, string>;

		const andThenned = await chain(res)
			.andThenAsync(async (r) => ok(`Hello ${r.value}`))
			.result();

		assert.ok(andThenned.ok);
		assert.equal(andThenned.value, "Hello Alan");
	});

	it("ignores Err", async () => {
		const res = err("Ugh") as Result<string, string>;

		const andThenned = await chain(res)
			.andThenAsync(async (r) => ok(`Hello ${r.value}`))
			.result();

		assert.ok(!andThenned.ok);
		assert.equal(andThenned.err, "Ugh");
	});
});

describe("orElse", () => {
	it("ignores OK", () => {
		const res = ok("Alan") as Result<string, string>;

		const orElsed = chain(res)
			.orElse((r) => err(`Or elsed: ${r.err}`))
			.result();

		assert.ok(orElsed.ok);
		assert.equal(orElsed.value, "Alan");
	});

	it("handles Err", () => {
		const res = err("Ugh") as Result<string, string>;

		const orElsed = chain(res)
			.orElse((r) => err(`Or elsed: ${r.err}`))
			.result();

		assert.ok(!orElsed.ok);
		assert.equal(orElsed.err, "Or elsed: Ugh");
	});
});

describe("orElseAsync", () => {
	it("ignores OK", async () => {
		const res = ok("Alan") as Result<string, string>;

		const orElsed = await chain(res)
			.orElseAsync(async (r) => err(`Or elsed: ${r.err}`))
			.result();

		assert.ok(orElsed.ok);
		assert.equal(orElsed.value, "Alan");
	});

	it("handles Err", async () => {
		const res = err("Ugh") as Result<string, string>;

		const orElsed = await chain(res)
			.orElseAsync(async (r) => err(`Or elsed: ${r.err}`))
			.result();

		assert.ok(!orElsed.ok);
		assert.equal(orElsed.err, "Or elsed: Ugh");
	});
});

describe("unwrap", () => {
	it("returns value for OK", () => {
		const res = ok("Alan") as Result<string, string>;

		assert.equal(chain(res).unwrap(), "Alan");
	});

	it("returns value for OK async", async () => {
		const res = ok("Alan") as Result<string, string>;

		assert.equal(
			await chain(res)
				.mapAsync(async (name) => name)
				.unwrap(),
			"Alan",
		);
	});

	it("throws for Err", () => {
		const res = err("Ugh") as Result<string, string>;

		assert.throws(() => chain(res).unwrap());
	});

	it("throws for Err async", async () => {
		const res = err("Ugh") as Result<string, string>;

		await assert.rejects(
			async () =>
				await chain(res)
					.mapAsync(async (name) => name)
					.unwrap(),
		);
	});
});
