/**
 * A helper for testing type signatures. This should be used to verify that the
 * type signature of the provided callback is the same as provided in the
 * generic template type.
 *
 * @template TestType - this type will be checked against the return type of the
 * provided callback.
 */
export function test<TestType>(_callback: (x: unknown) => TestType): void {}
