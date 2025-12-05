# 🤷‍♂️@nalanj/result

Try-free result handling for TypeScript

## Installation

## Usage

### ok(value: T): OK<T>

Creates an `OK` value representing a successful result.

#### Example

```typescript
import { ok } from "@nalanj/result";

const result = ok(12);
console.log(result.ok); // true
console.log(result.value); // 12
``` 

### err(error: E): Err<E>

Creates an `Err` value respresenting a failure.

While you will very often have an `Err<Error>` as a type to wrap exceptions, it's not required.


#### Example

```typescript
import { err } from "@nalanj/result";

const result = err("It broke");
console.log(result.ok); // false
console.log(result.err); // It broke
```

### unwrap<T, E>(result: Result<T, E>): T

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
