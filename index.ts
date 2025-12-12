export { chain } from "./chain.ts";

export type OK<T> = {
	readonly ok: true;
	readonly value: T;
};

export type Err<E> = {
	readonly ok: false;
	readonly err: E;
};

export type Result<T, E> = OK<T> | Err<E>;

/**
 * Creates an `OK` value representing a successful result.
 */
export function ok<T>(t: T): OK<T> {
	return { ok: true, value: t };
}

/**
 * Creates an `Err` value respresenting a failure.
 *
 * While you will very often have an `Err<Error>` as a type to wrap exceptions, it's not required.
 */
export function err<E>(e: E): Err<E> {
	return { ok: false, err: e };
}

/**
 * Returns a value of type `T` or throws an error.
 */
export function unwrap<T, E>(r: Result<T, E>): T {
	if (r.ok) {
		return r.value;
	} else {
		throw r.err;
	}
}
