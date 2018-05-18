// Augury makes use of some new ES proposed Reflect APIs. This polyfill includes
// support for them. However, Angular also relies on these and includes it's own
// version of the polyfill. We use a TypeScript ambient declaration to avoid
// bundling the `reflect-metadata` library in our code directly. This avoids
// potential conflicts with the angular angular application.
export * from 'reflect-metadata';
