# @nalanj/result 🤷‍♂️

Try-free result handling for TypeScript

## Installation

## Usage

`result` helps you handle errors in TypeScript projects without relying on
`try/catch`. It provides helpers `ok` and `err` for representing success and
failure. It also includes a `chain` help that allows for lightweight functional
handling  of results.

```
import { err, ok, chain } from "@nalanj/result";

function divide(numerator: number, denominator: number) {
  if (denominator === 0) {
    return err("Divide by zero error");
  }

  return ok(numerator / denominator);
}

const finalValue = chain(divide(12, 3))
  .inspect(console.log)
  .ifOK((value) => divide(value, 2))
  .ifErr((error) => err(`Something went wrong: ${error}`))
  .unwrap();

console.log(finalValue);
```

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
  - [chain.ifOK](#chainifok)
  - [chain.ifOKAsync](#chainifokasync)
  - [chain.ifErr](#chainiferr)
  - [chain.ifErrAsync](#chainiferrasync)
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

```typescript
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
export function chain<T,E>(r: T | Result<T, E>): ResultChain<T, E>)
```

Chain takes a value or a result and allows for chained calls against it.
Chain itself always returns a `ResultChain`, but chained calls may return a
`ResultChain` or `AsyncResultChain` depending on if the chained function is
async or not. Once an async function is called, the remaining calls always
return an `AsyncResultChain`.

#### Example

```typescript
const chainResult = chain("Frank")
  .map((name) => `Hello ${name}!`)
  .map((message) => `${message} How are you?`)
  .result();

const chainResult = chain(ok("Frank"))
  .map((name) => `Hello ${name}!`)
  .map((message) => `${message} How are you?`)
  .result();

const asyncChainResult = await chain(ok("Frank"))
  .mapAsync((name) => find(name))
  .mapAsync((user) => updateUser({ name: "Frank Smith" }))
  .result();
```

### chain.inspect

```typescript
chain.inspect(fn: (r: Result<T, E>) => void): ResultChain<T, E>
asyncChain.inspect(fn: (r: Result<T, E>) => void): AsyncResultChain<T, E>
```

`inspect` calls the given function on the current result in the chain and
returns a chain with the same `Result`. It's useful for cases like logging a
value in a chain.

#### Example

```typescript
chain("Frank")
  .map((firstName) => `${name} Smith`)
  .inspect((fullName) => console.log(fullName))
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
await chain("Frank")
  .map((firstName) => `${firstName} Smith`)
  .inspectAsync(async (fullName) => await auditLog(fullName))
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

#### Example

```typescript
chain("Frank")
  .map((firstName) => `${name} Smith`)
  result();
```

### chain.mapAsync

```typescript
chain.mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
asyncChain.mapAsync<U>(fn: (t: T) => Promise<U>): AsyncResultChain<U, E>;
```

`mapAsync` converts one type of `OK` value into another, just like `map`, but
allows the conversion function to be async. If the current result in the chain
is `OK`, calls the given async `fn` with the current result value as an argument.
Otherwise, passes the current result along the chain.

#### Example

```typescript
await chain(username)
  .mapAsync(async (username) => await loadUser(username))
  .result();
```

### chain.mapErr

```typescript
chain.mapErr<S>(fn: (e: E) => S): ResultChain<T, S>;
asyncChain.mapErr<S>(fn: (e: E) => S): AsyncResultChain<T, S>;
```

`mapErr` converts one type of `Err` value into another. If the current result
in the chain is `Err`, calls the given `fn` with the current error value as an
argument. Otherwise, passes the current result along the chain.

#### Example

```typescript
chain(err("It broke"))
  .mapErr((error) => `Cause: ${error}`)
  .result();
```

### chain.mapErrSync

```typescript
chain.mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
asyncChain.mapErrAsync<S>(fn: (e: E) => Promise<S>): AsyncResultChain<T, S>;
```

`mapErrAsync` converts one type of `Err` value into another, just like `mapErr`,
but allows the conversion function to be async. If the current result in the
chain is `Err`, calls the given async `fn` with the current error value as an
argument. Otherwise, passes the current result along the chain.

#### Example

```typescript
await chain(username)
  .ifOKAsync((value) => await loadUserByUsername(value))
  .mapErrAsync(async (error) => await loadUserByEmail(r.value))
  .result();
```

### chain.ifOK

```typescript
chain.ifOK<U>(fn: (r: T) => Result<U, E>): ResultChain<U, E>;
asyncChain.ifOK<U>(fn: (r: T) => Result<U, E>): ResultChain<U, E>;
```

If the current result in the chain is `OK`, calls the given `fn` with the
current value as an argument. Otherwise, passes the current result along the
chain.

#### Example

```typescript
chain(username)
  .ifOK((value) => validateUsername(value))
  .result();
```

### chain.ifOKAsync

```typescript
chain.ifOKAsync<U>(fn: (r: T) => Promise<Result<U, E>>): AsyncResultChain<U, E>;
asyncChain.ifOKAsync<U>(fn: (r: T) => Promise<Result<U, E>>): AsyncResultChain<U, E>;
```

If the current result in the chain is `OK`, calls the given async `fn` with the
current value as an argument. Otherwise, passes the current result along the
chain.

#### Example

```typescript
await chain(username)
  .ifOKAsync((value) => await loadUser(value))
  .result();
```

### chain.ifErr

```typescript
chain.ifErr<S>(fn: (r: E) => Result<T, S>): ResultChain<T, S>;
asyncChain.ifErr<S>(fn: (r: E) => Result<T, S>): AsyncResultChain<T, S>;
```

If the current result in the chain is `Err`, calls the given `fn` with the
current error value as an argument. Otherwise, passes the current result along
the chain.

#### Example

```typescript
chain(divisor)
  .ifOK((value) => divide(12, value))
  .ifErr((error) => ok(0))
  .result();
```

### chain.ifErrAsync

```typescript
chain.ifErrAsync<S>(fn: (r: E) => Promise<Result<T, S>>): AsyncResultChain<T, S>;
asyncChain.ifErrAsync<S>(fn: (r: E) => Promise<Result<T, S>>): AsyncResultChain<T, S>;
```

If the current result in the chain is `Err`, calls the given async `fn` with
the current error value as an argument. Otherwise, passes the current result
along the chain.

#### Example

```typescript
await chain(newPlan)
  .ifOKAsync((r) => await setPlan(r.value))
  .ifErrAsync((r) => {
    return err({
      message: r.err.message,
      planOptions: await listPlans()
    });
  })
  .result();
```

### chain.result

```typescript
chain.result(): Result<T, E>;
asyncChain.result: Promise<Result<T,E>>;
```

Returns the last result value on the chain. If it's an async chain, returns
a promise that will resolve to the last result once all promises in the chain
have completed.

#### Example

```typescript
// returns a Result<User, unknown>
chain(userId)
  .map(loadUser)
  .result();
```

### chain.unwrap

```typescript
chain.unwrap(): T;
asyncChain.unwrap(): Promise<T>;
```

Like [unwrap](#unwrap), either returns the success value or throws the error
value for the last result on the chain.

#### Example

```typescript
// returns the user or throws if the user wasn't found
chain(userId)
  .map(loadUser)
  .unwrap();
```
