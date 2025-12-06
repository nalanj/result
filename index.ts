export type OK<T> = {
	readonly ok: true;
	readonly value: T;
};

export type Err<E> = {
	readonly ok: false;
	readonly err: E;
};

export type Result<T, E> = OK<T> | Err<E>;

export function ok<T>(t: T): OK<T> {
	return { ok: true, value: t };
}

export function err<E>(e: E): Err<E> {
	return { ok: false, err: e };
}

export function unwrap<T, E>(r: Result<T, E>): T {
	if (r.ok) {
		return r.value;
	} else {
		throw r.err;
	}
}
