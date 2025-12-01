# 🤷‍♂️result

Try-free result handling for TypeScript

## Installation

## Usage

### ok(value: T): OK<T>

Creates an `OK` value representing a successful result.

#### Example

```typescript
import { ok } from "@nalanj/result";

const result = ok(12);
``` 

### err(error: E): Err<E>

Creates an `Err` value respresenting a failure.

While you will very often have an `Err<Error>` as a type to wrap exceptions, it's not required.


#### Example

```typescript
import { err } from "@nalanj/result";

const result = err(12);
```

### isOK

#### Example

```typescript
import { ok, err, isOK } from "@nalanj/result";

const good = ok("Good");
if (isOK(good)) {
  console.log("It's good")
}
```


### isErr

### unwrap<T, E>(result: Result<T, E>): T

Returns a value of type `T` or throws an error.

#### Example

```typescript
import { ok, err, unwrap } from "@nalanj/result";

const good = ok("Good");
console.log(unwrap(good));

const bad = err("So bad");

// will throw
console.log(unwrap(bad));
```
