import assert from "node:assert";
import { describe, it } from "node:test";
import { asyncChain, chain } from "./chain.ts";
import { err, ok, type Result } from "./index.ts";

describe("chain", () => {
	describe("result", () => {
		it("returns the result", () => {
			const res = chain("Testing").result();

			assert.ok(res.ok);
			assert.equal(res.value, "Testing");
		});
	});

	describe("inspect", () => {
		it("calls the fn and passes on the result for ok", () => {
			let called = false;

			const res = chain("Testing")
				.inspect((r) => {
					assert.ok(r.ok);
					called = true;
				})
				.result();

			assert.ok(called);
			assert.ok(res.ok);
		});

		it("calls the fn and passes on the result for err", () => {
			let called = false;

			const res = chain(err("Testing"))
				.inspect((r) => {
					assert.ok(!r.ok);
					called = true;
				})
				.result();

			assert.ok(called);
			assert.ok(!res.ok);
		});

		describe("inspectAsync", () => {
			it("calls the fn and passes the result for ok", async () => {
				let called = false;

				const res = await chain("Testing")
					.inspectAsync(async (r) => {
						assert.ok(r.ok);
						called = true;
					})
					.result();

				assert.ok(called);
				assert.ok(res.ok);
			});

			it("calls the fn and passes the result for err", async () => {
				let called = false;

				const res = await chain(err("Testing"))
					.inspectAsync(async (r) => {
						assert.ok(!r.ok);
						called = true;
					})
					.result();

				assert.ok(called);
				assert.ok(!res.ok);
			});
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
				.ifOK((value) => ok(`Hello ${value}`))
				.result();

			assert.ok(andThenned.ok);
			assert.equal(andThenned.value, "Hello Alan");
		});

		it("ignores Err", () => {
			const res = err("Ugh") as Result<string, string>;

			const andThenned = chain(res)
				.ifOK((value) => ok(`Hello ${value}`))
				.result();

			assert.ok(!andThenned.ok);
			assert.equal(andThenned.err, "Ugh");
		});
	});

	describe("andThenAsync", () => {
		it("handles OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const andThenned = await chain(res)
				.ifOKAsync(async (value) => ok(`Hello ${value}`))
				.result();

			assert.ok(andThenned.ok);
			assert.equal(andThenned.value, "Hello Alan");
		});

		it("ignores Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const andThenned = await chain(res)
				.ifOKAsync(async (value) => ok(`Hello ${value}`))
				.result();

			assert.ok(!andThenned.ok);
			assert.equal(andThenned.err, "Ugh");
		});
	});

	describe("orElse", () => {
		it("ignores OK", () => {
			const res = ok("Alan") as Result<string, string>;

			const orElsed = chain(res)
				.ifErr((error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(orElsed.ok);
			assert.equal(orElsed.value, "Alan");
		});

		it("handles Err", () => {
			const res = err("Ugh") as Result<string, string>;

			const orElsed = chain(res)
				.ifErr((error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(!orElsed.ok);
			assert.equal(orElsed.err, "Or elsed: Ugh");
		});
	});

	describe("orElseAsync", () => {
		it("ignores OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const orElsed = await chain(res)
				.ifErrAsync(async (error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(orElsed.ok);
			assert.equal(orElsed.value, "Alan");
		});

		it("handles Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const orElsed = await chain(res)
				.ifErrAsync(async (error) => err(`Or elsed: ${error}`))
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

		it("throws for Err", () => {
			const res = err("Ugh") as Result<string, string>;

			assert.throws(() => chain(res).unwrap());
		});
	});
});

describe("asyncChain", () => {
	describe("result", () => {
		it("returns the result", async () => {
			const res = await asyncChain(Promise.resolve(ok("Testing"))).result();

			assert.ok(res.ok);
			assert.equal(res.value, "Testing");
		});
	});

	describe("inspect", () => {
		it("calls the fn and passes on the result for ok", async () => {
			let called = false;

			const res = await asyncChain(Promise.resolve(ok("Testing")))
				.inspect((r) => {
					assert.ok(r.ok);
					called = true;
				})
				.result();

			assert.ok(called);
			assert.ok(res.ok);
		});

		it("calls the fn and passes on the result for err", async () => {
			let called = false;

			const res = await asyncChain(Promise.resolve(err("Testing")))
				.inspect((r) => {
					assert.ok(!r.ok);
					called = true;
				})
				.result();

			assert.ok(called);
			assert.ok(!res.ok);
		});

		describe("inspectAsync", () => {
			it("calls the fn and passes the result for ok", async () => {
				let called = false;

				const res = await asyncChain(Promise.resolve(ok("Testing")))
					.inspectAsync(async (r) => {
						assert.ok(r.ok);
						called = true;
					})
					.result();

				assert.ok(called);
				assert.ok(res.ok);
			});

			it("calls the fn and passes the result for err", async () => {
				let called = false;

				const res = await asyncChain(Promise.resolve(err("Testing")))
					.inspectAsync(async (r) => {
						assert.ok(!r.ok);
						called = true;
					})
					.result();

				assert.ok(called);
				assert.ok(!res.ok);
			});
		});
	});

	describe("map", () => {
		it("handles OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.map((name: string) => `Hello ${name}`)
				.result();

			assert.ok(mapped.ok);
			assert.equal(mapped.value, "Hello Alan");
		});

		it("ignores Err", async () => {
			const res = err("It broke") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.map((name: string) => `Hello ${name}`)
				.result();

			assert.ok(!mapped.ok);
			assert.equal(mapped.err, "It broke");
		});
	});

	describe("mapAsync", () => {
		it("handles OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.mapAsync(async (name: string) => `Hello ${name}`)
				.result();

			assert.ok(mapped.ok);
			assert.equal(mapped.value, "Hello Alan");
		});

		it("ignores Err", async () => {
			const res = err("It broke") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.mapAsync(async (name: string) => `Hello ${name}`)
				.result();

			assert.ok(!mapped.ok);
			assert.equal(mapped.err, "It broke");
		});
	});

	describe("mapErr", () => {
		it("ignores OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.mapErr((cause: string) => `It broke because ${cause}`)
				.result();

			assert.ok(mapped.ok);
			assert.equal(mapped.value, "Alan");
		});

		it("handles Err", async () => {
			const res = err("a crash");

			const mapped = await asyncChain(Promise.resolve(res))
				.mapErr((cause: string) => `It broke because ${cause}`)
				.result();

			assert.ok(!mapped.ok);
			assert.equal(mapped.err, "It broke because a crash");
		});
	});

	describe("mapErrAsync", () => {
		it("ignores OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const mapped = await asyncChain(Promise.resolve(res))
				.mapErrAsync(async (cause: string) => `It broke because ${cause}`)
				.result();

			assert.ok(mapped.ok);
			assert.equal(mapped.value, "Alan");
		});

		it("handles Err", async () => {
			const res = err("a crash");

			const mapped = await asyncChain(Promise.resolve(res))
				.mapErrAsync(async (cause: string) => `It broke because ${cause}`)
				.result();

			assert.ok(!mapped.ok);
			assert.equal(mapped.err, "It broke because a crash");
		});
	});

	describe("andThen", () => {
		it("handles OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const andThenned = await asyncChain(Promise.resolve(res))
				.ifOK((value) => ok(`Hello ${value}`))
				.result();

			assert.ok(andThenned.ok);
			assert.equal(andThenned.value, "Hello Alan");
		});

		it("ignores Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const andThenned = await asyncChain(Promise.resolve(res))
				.ifOK((value) => ok(`Hello ${value}`))
				.result();

			assert.ok(!andThenned.ok);
			assert.equal(andThenned.err, "Ugh");
		});
	});

	describe("andThenAsync", () => {
		it("handles OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const andThenned = await asyncChain(Promise.resolve(res))
				.ifOKAsync(async (value) => ok(`Hello ${value}`))
				.result();

			assert.ok(andThenned.ok);
			assert.equal(andThenned.value, "Hello Alan");
		});

		it("ignores Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const andThenned = await asyncChain(Promise.resolve(res))
				.ifOKAsync(async (value) => ok(`Hello ${value}`))
				.result();

			assert.ok(!andThenned.ok);
			assert.equal(andThenned.err, "Ugh");
		});
	});

	describe("orElse", () => {
		it("ignores OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const orElsed = await asyncChain(Promise.resolve(res))
				.ifErr((error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(orElsed.ok);
			assert.equal(orElsed.value, "Alan");
		});

		it("handles Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const orElsed = await asyncChain(Promise.resolve(res))
				.ifErr((error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(!orElsed.ok);
			assert.equal(orElsed.err, "Or elsed: Ugh");
		});
	});

	describe("orElseAsync", () => {
		it("ignores OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const orElsed = await asyncChain(Promise.resolve(res))
				.ifErrAsync(async (error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(orElsed.ok);
			assert.equal(orElsed.value, "Alan");
		});

		it("handles Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			const orElsed = await asyncChain(Promise.resolve(res))
				.ifErrAsync(async (error) => err(`Or elsed: ${error}`))
				.result();

			assert.ok(!orElsed.ok);
			assert.equal(orElsed.err, "Or elsed: Ugh");
		});
	});

	describe("unwrap", () => {
		it("returns value for OK", async () => {
			const res = ok("Alan") as Result<string, string>;

			const unwrapped = await asyncChain(Promise.resolve(res)).unwrap();
			assert.equal(unwrapped, "Alan");
		});

		it("throws for Err", async () => {
			const res = err("Ugh") as Result<string, string>;

			await assert.rejects(async () =>
				asyncChain(Promise.resolve(res)).unwrap(),
			);
		});
	});
});
