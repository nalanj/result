# @nalanj/result 🤷‍♂️

Try-free result handling for TypeScript

## Installation

## Usage

[Basic usage example goes here]

## API Docs

- [ok](#ok)
- [err](#err)
- [unrwap](#unwrap)
- [chain](#chain)
- [chain.inspect](#chaininspect)
- [chain.inspectAsync](#chaininspectasync)
- [chain.map](#chainmap)
- [chain.mapAsync](#chainmapasync)
- [chain.mapErr](#chainmaperr)
- [chain.mapErrAsync](#chainmaperrasync)
- [chain.andThen](#chainandthen)
- [chain.andThenAsync](#chainandthenasync)
- [chain.orElse](#chainorelse)
- [chain.orElseAsync](#chainorelse)
- [chain.result](#chainresult)
- [chain.unwrap](#chainunwrap)

### ok

```typescript
export function ok<T>(t: T): OK<T>
```

Creates an `OK` value representing a successful result.

#### Example

```typescript
import { ok } from "@nalanj/result";

const result = ok(12);
console.log(result.ok); // true
console.log(result.value); // 12
``` 

### err

```
export function err(error: E): Err<E>
```

Creates an `Err` value respresenting a failure.

`Err<Error>` will often be used to wrap exceptions, but it's not required.

#### Example

```typescript
import { err } from "@nalanj/result";

const result = err("It broke");
console.log(result.ok); // false
console.log(result.err); // It broke
```

### unwrap

```typescript
export function unwrap<T, E>(result: Result<T, E>): T
```

Returns a value of type `T` or throws an error.

#### Example

```typescript
import { ok, err, unwrap } from "@nalanj/result";

const good = ok("Good");
console.log(unwrap(good)); // Good

const bad = err("So bad");

// will throw
console.log(unwrap(bad));
```

### chain

```typescript
export function chain<T,E>(r: Result<T, E>): ResultChain<T, E>)
```

Chain takes a result and allows for chained calls against it. Chain itself
always returns a `ResultChain`, but chained calls may return a `ResultChain`
or `AsyncResultChain` depending on if the chained function is async or not. Once
an async function is called, the remaining calls always return an
`AsyncResultChain`.

#### Example

```typescript
const chainResult = chain(ok("Frank"))
  .map((name) => `Hello ${name}!`)
  .map((message) => `${message} How are you?`)
  .result()

const asyncChainResult = await chain(ok("Frank"))
  .mapAsync((name) => find(name))
  .mapAsync((user) => updateUser({ name: "Frank Smith" }))
  .result()
```

### chain.inspect

```typescript
chain.inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>
asyncChain.inspect(fn: (r: Result<T, E>) => void): AsyncResultChain<T, E>
```

`inspect` calls the given function on the current result in the chain and returns
a chain with the same `Result`. It's useful for cases like logging
a value in a chain.

#### Example

```typescript
chain(ok("Frank"))
  .map(firstName => `${name} Smith`)
  .inspect(fullName => console.log(fullName))
  .result();
```

### chain.inspectAsync

```typescript
chain.inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;
asyncChain.inspectAsync(fn: (r: Result<T, E>) => Promise<void>): AsyncResultChain<T, E>;
```

`inspectAsync` is identical to `inspect` except that it takes an async function
and results in an `AsyncResultChain`.


#### Example

```typescript
await chain(ok("Frank"))
  .map(firstName => `${name} Smith`)
  .inspectAsync(fullName => auditLog(fullName))
  .result();
```

### chain.map

```typescript
chain.map<U>(fn: (t: T) => U): ResultChain<U, E>;
asyncChain.map<U>(fn: (t: T) => U): AsyncResultChain<U, E>;
```

`map` converts one type of `OK` value into another. If the current result in
the chain is `OK`, calls `fn` with the current result value as an argument.
Otherwise, passes the current result along the chain.

### chain.mapAsync

```typescript
chain.mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
asyncChain.mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
```

`mapAsync` converts one type of `OK` value into another, just like `map`, but
allows the conversion function to be async. If the current result in the chain
is `OK`, calls the given async `fn` with the current result value as an argument.
Otherwise, passes the current result along the chain.

### chain.mapErr

```typescript
chain.mapErr<S>(fn: (e: E) => S): ResultChain<T, S>;
asyncChain.mapErr<S>(fn: (e: E) => S): AsyncResultChain<T, S>;
```

`mapErr` converts one type of `Err` value into another. If the current result
in the chain is `Err`, calls the given `fn` with the current error value as an
argument. Otherwise, passes the current result along the chain.

### chain.mapErrSync

```typescript
chain.mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
asyncChain.mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
```

`mapErrAsync` converts one type of `Err` value into another, just like `mapErr`,
but allows the conversion function to be async. If the current result in the
chain is `Err`, calls the given async `fn` with the current error value as an
argument. Otherwise, passes the current result along the chain.

### chain.andThen

```typescript
chain.andThen<U>(fn: (r: OK<T>) => Result<U, E>): ResultChain<U, E>;
asyncChain.andThen<U>(fn: (r: OK<T>) => Result<U, E>): ResultChain<U, E>;
```

`andThen` converts one type of `Result` into another when the current result on
the chain is an `OK`. If the current result in the chain is `OK`, calls the
given `fn` with the current result as an argument. Otherwise, passes the current
result along the chain.

### chain.andThenAsync

```typescript
chain.andThenAsync<U>(fn: (r: OK<T>) => Promise<Result<U, E>>): AsyncResultChain<U, E>;
asyncChain.andThenAsync<U>(fn: (r: OK<T>) => Promise<Result<U, E>>): AsyncResultChain<U, E>;
```

If the current result in the chain is `OK`, calls the given async `fn`
with the current result as an argument. Otherwise, passes the current
result along the chain.

### chain.orElse

```typescript
chain.orElse<S>(fn: (r: Err<E>) => Result<T, S>): ResultChain<T, S>;
asyncChain.orElse<S>(fn: (r: Err<E>) => Result<T, S>): AsyncResultChain<T, S>;
```

If the current result in the chain is `Err`, calls the given `fn` with the
current result as an argument. Otherwise, passes the current
result along the chain.

### chain.orElseAsync

```typescript
chain.orElseAsync<S>(fn: (r: Err<E>) => Promise<Result<T, S>>): AsyncResultChain<T, S>;
asyncChain.orElseAsync<S>(fn: (r: Err<E>) => Promise<Result<T, S>>): AsyncResultChain<T, S>;
```

If the current result in the chain is `Err`, calls the given async `fn` with
the current error value as an argument. Otherwise, passes the current result
along the chain.

### chain.result

```typescript
chain.result(): Result<T, E>;
asyncChain.result: Promise<Result<T,E>>;
```

Returns the last result value on the chain. If it's an async chain, returns
a promise that will resolve to the last result once all promises in the chain
have completed.

### chain.unwrap

```typescript
chain.unwrap(): T;
asyncChain.unwrap(): Promise<T>;
```

Like [unwrap](#unwrap), either returns the success value or throws the error
value for the last result on the chain.
