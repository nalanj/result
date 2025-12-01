const okSym = Symbol("OK");
const valSym = Symbol("Value");

export type OK<T> = {
	[okSym]: true;
	[valSym]: T;
};

export type Err<E> = {
	[okSym]: false;
	[valSym]: E;
};

export type Result<T, E> = OK<T> | Err<E>;

export function ok<T>(t: T): OK<T> {
	return { [okSym]: true, [valSym]: t };
}

export function isOK<T, E>(r: Result<T, E>): r is OK<T> {
	return r[okSym] === true;
}

export function err<E>(e: E): Err<E> {
	return { [okSym]: false, [valSym]: e };
}

export function isErr<E>(r: Result<unknown, E>): r is Err<E> {
	return r[okSym] === false;
}
