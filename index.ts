type OK<T> = {
	readonly ok: true;
	readonly value: T;
};

type Err<E> = {
	readonly ok: false;
	readonly err: E;
};

export type Result<T, E> = OK<T> | Err<E>;

export function ok<T>(t: T): OK<T> {
	return {
		get ok(): true {
			return true;
		},

		get value(): T {
			return t;
		},
	};
}

export function err<E>(e: E): Err<E> {
	return {
		get ok(): false {
			return false;
		},
		get err(): E {
			return e;
		},
	};
}

export function unwrap<T, E>(r: Result<T, E>): T {
	if (r.ok) {
		return r.value;
	} else {
		throw r.err;
	}
}
