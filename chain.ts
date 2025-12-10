import { type Err, err, type OK, ok, type Result, unwrap } from "./index.ts";

export type ResultChain<T, E> = {
	inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>;
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
	inspect(fn: (r: Result<T, E>) => void): AsyncResultChain<T, E>;
	inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;
	map<U>(fn: (t: T) => U): AsyncResultChain<U, E>;
	mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
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

export function chain<T, E>(r: Result<T, E>): ResultChain<T, E> {
	if (r.ok) {
		return okChain(r);
	}

	return errChain(r);
}

export function asyncChain<T, E>(
	promise: Promise<Result<T, E>>,
): AsyncResultChain<T, E> {
	return {
		inspect: (fn) =>
			asyncChain(promise.then((r) => chain(r).inspect(fn).result())),
		inspectAsync: (fn) =>
			asyncChain(promise.then((r) => chain(r).inspectAsync(fn).result())),
		map: (fn) => asyncChain(promise.then((r) => chain(r).map(fn).result())),
		mapAsync: (fn) =>
			asyncChain(promise.then((r) => chain(r).mapAsync(fn).result())),
		andThen: (fn) =>
			asyncChain(promise.then((r) => chain(r).andThen(fn).result())),
		andThenAsync: (fn) =>
			asyncChain(promise.then((r) => chain(r).andThenAsync(fn).result())),
		orElse: (fn) =>
			asyncChain(promise.then((r) => chain(r).orElse(fn).result())),
		orElseAsync: (fn) =>
			asyncChain(promise.then((r) => chain(r).orElseAsync(fn).result())),

		result: () => {
			return promise;
		},
		unwrap: async () => {
			const r = await promise;
			return unwrap(r);
		},
	};
}

function okChain<T, E>(r: OK<T>): ResultChain<T, E> {
	return {
		inspect: (fn) => {
			fn(r);

			return okChain(r);
		},
		inspectAsync: (fn) => {
			const promise = fn(r).then(() => r);

			return asyncChain(promise);
		},
		map: (fn) => chain(ok(fn(r.value))),
		mapAsync: (fn) => asyncChain(fn(r.value).then((v) => ok(v))),
		mapErr: (_) => chain(r),
		mapErrAsync: (_) => asyncChain(Promise.resolve(r)),
		andThen: (fn) => chain(fn(r)),
		andThenAsync: (fn) => asyncChain(fn(r)),
		orElse: (_) => chain(r),
		orElseAsync: (_) => asyncChain(Promise.resolve(r)),
		result: () => r,
		unwrap: () => r.value,
	};
}

function errChain<T, E>(r: Err<E>): ResultChain<T, E> {
	return {
		inspect: (fn) => {
			fn(r);

			return errChain(r);
		},
		inspectAsync: (fn) => {
			const promise = fn(r).then(() => r);

			return asyncChain(promise);
		},
		map: (_) => chain(r),
		mapAsync: (_) => asyncChain(Promise.resolve(r)),
		mapErr: (fn) => chain(err(fn(r.err))),
		mapErrAsync: (fn) => asyncChain(fn(r.err).then((e) => err(e))),
		andThen: (_) => chain(r),
		andThenAsync: (_) => asyncChain(Promise.resolve(r)),
		orElse: (fn) => chain(fn(r)),
		orElseAsync: (fn) => asyncChain(fn(r)),
		result: () => r,
		unwrap: () => {
			throw r.err;
		},
	};
}
