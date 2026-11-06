# Security Policy

Ferrule's CLI writes files into your project, and its components run inside your app, so we treat these as security issues:

- Any way to make `ferrule init` or `ferrule add` write outside the project folder.
- Code in a package or registry component that sends data anywhere. Ferrule makes no network requests of its own.

Please report privately via GitHub: **Security → Report a vulnerability** on https://github.com/leoAnimesh/ferrule. Do not open a public issue. We aim to reply within 7 days.

Only the latest release is supported.
