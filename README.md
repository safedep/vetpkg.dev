# vetpkg.dev 🚀

This application is live at [https://vetpkg.dev](https://vetpkg.dev)

## Development

### Prerequisites

> Note: You can skip `ASDF` setup if you already have the required
> version of `nodejs` installed on your system. Look at `.tool-versions` file
> to see the required version and other required tools.

- [ASDF](https://asdf-vm.com/guide/getting-started.html)
- Install the required version of `nodejs` using `asdf`:```shell
  asdf install

````

### Setup

- Configure `buf` schema registry

```shell
pnpm config set @buf:registry https://buf.build/gen/npm/v1/
````

- Install `npm` dependencies:

```shell
pnpm install
```

### Running the development server

- Start the development server:

```shell
pnpm dev
```

- Navigate to `http://localhost:3000` in your browser.

### Testing

- Run the test suite:

```shell
pnpm test
```

## References

- [SafeDep Cloud](https://docs.safedep.io/cloud)
- [deps.dev](https://deps.dev)
- [osv.dev](https://osv.dev)
