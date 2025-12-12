import { type Err, err, type OK, ok, type Result, unwrap } from "./index.ts";

export type ResultChain<T, E> = {
	/**
	 * Calls the given function on the current result in the chain and returns
	 * a chain with the same `Result`. It's useful for cases like logging
	 * a value in a chain.
	 */
	inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>;

	/**
	 * Calls the given async function on the current result in the chain and
	 * returns an async chain with the same `Result`. It's useful for cases like
	 * asynchronously recording a value in a chain.
	 */
	inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;

	map<U>(fn: (t: T) => U): ResultChain<U, E>;
	mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
	mapErr<S>(fn: (e: E) => S): ResultChain<T, S>;
	mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
	andThen<U>(fn: (r: OK<T>) => Result<U, E>): ResultChain<U, E>;
	andThenAsync<U>(
		fn: (r: OK<T>) => Promise<Result<U, E>>,
	): AsyncResultChain<U, E>;
	orElse<S>(fn: (r: Err<E>) => Result<T, S>): ResultChain<T, S>;
	orElseAsync<S>(
		fn: (r: Err<E>) => Promise<Result<T, S>>,
	): AsyncResultChain<T, S>;

	result(): Result<T, E>;
	unwrap(): T;
};

export type AsyncResultChain<T, E> = {
	/**
	 * Calls the given function on the current result in the chain and returns
	 *	a chain with the same `Result`. It's useful for cases like logging
	 * a value in a chain.
	 */
	inspect(fn: (r: Result<T, E>) => void): AsyncResultChain<T, E>;

	/**
	 * Calls the given async function on the current result in the chain and
	 * returns an async chain with the same `Result`. It's useful for cases like
	 * asynchronously recording a value in a chain.
	 */
	inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;
	map<U>(fn: (t: T) => U): AsyncResultChain<U, E>;
	mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
	mapErr<S>(fn: (e: E) => S): AsyncResultChain<T, S>;
	mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
	andThen<U>(fn: (r: OK<T>) => Result<U, E>): AsyncResultChain<U, E>;
	andThenAsync<U>(
		fn: (r: OK<T>) => Promise<Result<U, E>>,
	): AsyncResultChain<U, E>;
	orElse<S>(fn: (r: Err<E>) => Result<T, S>): AsyncResultChain<T, S>;
	orElseAsync<S>(
		fn: (r: Err<E>) => Promise<Result<T, S>>,
	): AsyncResultChain<T, S>;

	result(): Promise<Result<T, E>>;
	unwrap(): Promise<T>;
};

/**
 * Chain takes a result and allows for chained calls against it. Chain itself
 * always returns a `ResultChain`, but chained calls may return a `ResultChain`
 * or `AsyncResultChain` depending on if the chained function is async or not. Once
 * an async function is called, the remaining calls always return an
 * `AsyncResultChain`.
 */
export function chain<T, E>(r: T | Result<T, E>): ResultChain<T, E> {
	if (typeof r !== "object" || r === null || !("ok" in r)) {
		r = ok(r);
	}

	return syncChain(r);
}

export function syncChain<T, E>(r: Result<T, E>): ResultChain<T, E> {
	return {
		inspect: (fn) => {
			fn(r);
			return syncChain(r);
		},
		inspectAsync: (fn) => asyncChain(fn(r).then(() => r)),
		map: (fn) => syncChain(r.ok ? ok(fn(r.value)) : r),
		mapAsync: (fn) =>
			asyncChain(r.ok ? fn(r.value).then((v) => ok(v)) : Promise.resolve(r)),
		mapErr: (fn) => syncChain(!r.ok ? err(fn(r.err)) : r),
		mapErrAsync: (fn) =>
			asyncChain(!r.ok ? fn(r.err).then((v) => err(v)) : Promise.resolve(r)),
		andThen: (fn) => syncChain(r.ok ? fn(r) : r),
		andThenAsync: (fn) => asyncChain(r.ok ? fn(r) : Promise.resolve(r)),
		orElse: (fn) => syncChain(!r.ok ? fn(r) : r),
		orElseAsync: (fn) => asyncChain(!r.ok ? fn(r) : Promise.resolve(r)),
		result: () => r,
		unwrap: () => unwrap(r),
	};
}

function asyncChain<T, E>(
	promise: Promise<Result<T, E>>,
): AsyncResultChain<T, E> {
	return {
		inspect: (fn) =>
			asyncChain(
				promise.then((r) => {
					fn(r);
					return r;
				}),
			),
		inspectAsync: (fn) =>
			asyncChain(
				promise.then(async (r) => {
					await fn(r);
					return r;
				}),
			),
		map: (fn) => asyncChain(promise.then((r) => (r.ok ? ok(fn(r.value)) : r))),
		mapAsync: (fn) =>
			asyncChain(
				promise.then((r) =>
					r.ok ? fn(r.value).then((v) => ok(v)) : Promise.resolve(r),
				),
			),
		mapErr: (fn) =>
			asyncChain(promise.then((r) => (!r.ok ? err(fn(r.err)) : r))),
		mapErrAsync: (fn) =>
			asyncChain(
				promise.then((r) =>
					!r.ok ? fn(r.err).then((v) => err(v)) : Promise.resolve(r),
				),
			),
		andThen: (fn) => asyncChain(promise.then((r) => (r.ok ? fn(r) : r))),
		andThenAsync: (fn) =>
			asyncChain(promise.then((r) => (r.ok ? fn(r) : Promise.resolve(r)))),
		orElse: (fn) => asyncChain(promise.then((r) => (!r.ok ? fn(r) : r))),
		orElseAsync: (fn) =>
			asyncChain(promise.then((r) => (!r.ok ? fn(r) : Promise.resolve(r)))),
		result: () => promise,
		unwrap: async () => {
			const r = await promise;
			return unwrap(r);
		},
	};
}
