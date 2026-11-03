The `@testing-library/jest-dom` patch adapts its Vitest declarations to the
`Matchers<R, T>` interface introduced in Vitest 5. It preserves the existing DOM
assertions, including regular expressions, without changing runtime behavior.

Remove the patch when jest-dom supports Vitest 5's matcher declarations upstream.
See the [Vitest migration guide](https://vitest.dev/guide/migration/#assertion-types-expose-return-and-received-types).
