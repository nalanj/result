import { type Err, err, type OK, ok, type Result } from "./index.ts";

export type ResultChain<T, E> = Result<T, E> & {
	inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>;
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
	const c: ResultChain<T, E> = {
		...r,
		inspect: (fn) => {
			fn(r);

			return c;
		},
		map: (fn) => chain(ok(fn(r.value))),
		mapErr: (_) => chain(r),
	};

	return c;
}

function errChain<T, E>(r: Err<E>): ResultChain<T, E> {
	const c: ResultChain<T, E> = {
		...r,
		inspect: (fn) => {
			fn(r);

			return c;
		},
		map: (_) => chain(r),
		mapErr: (fn) => chain(err(fn(r.err))),
	};

	return c;
}
