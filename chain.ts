import { err, ok, type Result, unwrap } from "./index.ts";

export type ResultChain<T, E> = {
	/**
	 * Calls the given function on the current result in the chain and returns
	 * a chain with the same `Result`. Useful for cases like logging a value in
	 * a chain.
	 */
	inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>;

	/**
	 * Calls the given async function on the current result in the chain and
	 * returns an async chain with the same `Result`. Useful for cases like
	 * asynchronously recording a value in a chain.
	 */
	inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;

	/**
	 * If the current result in the chain is `OK`, calls `fn` with the current
	 * result value as an argument. Otherwise, passes the current result along
	 * the chain.
	 */
	map<U>(fn: (t: T) => U): ResultChain<U, E>;

	/**
	 * If the current result in the chain is `OK`, calls the given async `fn`
	 * with the current result value as an argument. Otherwise, passes the
	 * current result along the chain.
	 */
	mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `Err`, calls the given `fn` with the
	 * current error value as an argument. Otherwise, passes the current
	 * result along the chain.
	 */
	mapErr<S>(fn: (e: E) => S): ResultChain<T, S>;

	/**
	 * If the current result in the chain is `Err`, calls the given async `fn`
	 * with the current error value as an argument. Otherwise, passes the
	 * current result along the chain.
	 */
	mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;

	/**
	 * If the current result in the chain is `OK`, calls the given `fn` with the
	 * current value as an argument. Otherwise, passes the current result
	 * along the chain.
	 */
	ifOK<U>(fn: (r: T) => Result<U, E>): ResultChain<U, E>;

	/**
	 * If the current result in the chain is `OK`, calls the given async `fn`
	 * with the current value as an argument. Otherwise, passes the current
	 * result along the chain.
	 */
	ifOKAsync<U>(fn: (r: T) => Promise<Result<U, E>>): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `Err`, calls the given `fn` with the
	 * current error as an argument. Otherwise, passes the current result along
	 * the chain.
	 */
	ifErr<S>(fn: (r: E) => Result<T, S>): ResultChain<T, S>;

	/**
	 * If the current result in the chain is `Err`, calls the given async `fn`
	 * with the current error value as an argument. Otherwise, passes the
	 * current result along the chain.
	 */
	ifErrAsync<S>(fn: (r: E) => Promise<Result<T, S>>): AsyncResultChain<T, S>;

	/**
	 * Returns the current result value in the chain.
	 */
	result(): Result<T, E>;

	/**
	 * Unwrap the current result in the chain. Returns either the value of the
	 * current result or throws the current error.
	 */
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

	/**
	 * If the current result in the chain is `OK`, call `fn` with the current
	 * result value as an argument. Otherwise, just pass the current result along
	 * the chain.
	 */
	map<U>(fn: (t: T) => U): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `OK`, call the given async `fn`
	 * with the current result value as an argument. Otherwise, just pass the
	 * current result along the chain.
	 */
	mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `Err`, call the given async `fn`
	 * with the current error value as an argument. Otherwise, just pass the
	 * current result along the chain.
	 */
	mapErr<S>(fn: (e: E) => S): AsyncResultChain<T, S>;

	/**
	 * If the current result in the chain is `Err`, call the given async `fn`
	 * with the current error value as an argument. Otherwise, just pass the
	 * current result along the chain.
	 */
	mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;

	/**
	 * If the current result in the chain is `OK`, call the given `fn` with the
	 * current value as an argument. Otherwise, just pass the current result
	 * along the chain.
	 */
	ifOK<U>(fn: (r: T) => Result<U, E>): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `OK`, call the given async `fn`
	 * with the current value as an argument. Otherwise, just pass the current
	 * result along the chain.
	 */
	ifOKAsync<U>(fn: (r: T) => Promise<Result<U, E>>): AsyncResultChain<U, E>;

	/**
	 * If the current result in the chain is `Err`, call the given `fn` with the
	 * current error as an argument. Otherwise, just pass the current
	 * result along the chain.
	 */
	ifErr<S>(fn: (r: E) => Result<T, S>): AsyncResultChain<T, S>;

	/**
	 * If the current result in the chain is `Err`, call the given async `fn`
	 * with the current error as an argument. Otherwise, just pass the current
	 * result along the chain.
	 */
	ifErrAsync<S>(fn: (r: E) => Promise<Result<T, S>>): AsyncResultChain<T, S>;

	/**
	 * Returns the current result value in the chain.
	 */
	result(): Promise<Result<T, E>>;

	/**
	 * Unwrap the current result in the chain. Returns either the value of the
	 * current result or throws the current error.
	 */
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
		ifOK: (fn) => syncChain(r.ok ? fn(r.value) : r),
		ifOKAsync: (fn) => asyncChain(r.ok ? fn(r.value) : Promise.resolve(r)),
		ifErr: (fn) => syncChain(!r.ok ? fn(r.err) : r),
		ifErrAsync: (fn) => asyncChain(!r.ok ? fn(r.err) : Promise.resolve(r)),
		result: () => r,
		unwrap: () => unwrap(r),
	};
}

export function asyncChain<T, E>(
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
		ifOK: (fn) => asyncChain(promise.then((r) => (r.ok ? fn(r.value) : r))),
		ifOKAsync: (fn) =>
			asyncChain(
				promise.then((r) => (r.ok ? fn(r.value) : Promise.resolve(r))),
			),
		ifErr: (fn) => asyncChain(promise.then((r) => (!r.ok ? fn(r.err) : r))),
		ifErrAsync: (fn) =>
			asyncChain(promise.then((r) => (!r.ok ? fn(r.err) : Promise.resolve(r)))),
		result: () => promise,
		unwrap: async () => {
			const r = await promise;
			return unwrap(r);
		},
	};
}
