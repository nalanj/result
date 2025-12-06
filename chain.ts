import { type Err, err, type OK, ok, type Result } from "./index.ts";

export type ResultChain<T, E> = Result<T, E> & {
	map<U>(fn: (t: T) => U): ResultChain<U, E>;
	mapErr<S>(fn: (e: E) => S): ResultChain<T, S>;
};

export function chain<T, E>(r: Result<T, E>): ResultChain<T, E> {
	if (r.ok) {
		return okChain(r);
	}

	return errChain(r);
}

function okChain<T, E>(r: OK<T>): ResultChain<T, E> {
	return {
		...r,
		map: (fn) => chain(ok(fn(r.value))),
		mapErr: (_) => chain(r),
	};
}

function errChain<T, E>(r: Err<E>): ResultChain<T, E> {
	return {
		...r,
		map: (_) => chain(r),
		mapErr: (fn) => chain(err(fn(r.err))),
	};
}
