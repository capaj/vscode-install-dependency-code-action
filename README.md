# vscode-install-dependency-code-action

<div align="center">

[![Version](https://img.shields.io/visual-studio-marketplace/v/capaj.install-dependency-code-action)](https://marketplace.visualstudio.com/items/capaj.install-dependency-code-action/changelog) [![Installs](https://img.shields.io/visual-studio-marketplace/i/capaj.install-dependency-code-action)](https://marketplace.visualstudio.com/items?itemName=capaj.install-dependency-code-action) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/capaj.install-dependency-code-action)](https://marketplace.visualstudio.com/items?itemName=capaj.install-dependency-code-action) [![Rating Star](https://img.shields.io/visual-studio-marketplace/stars/capaj.install-dependency-code-action)](https://marketplace.visualstudio.com/items?itemName=capaj.install-dependency-code-action&ssr=false#review-details) [![Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/capaj.install-dependency-code-action)](https://github.com/tjx666/install-dependency-code-action)

![CI](https://github.com/tjx666/install-dependency-code-action/actions/workflows/ci.yml/badge.svg) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![Github Open Issues](https://img.shields.io/github/issues/tjx666/install-dependency-code-action)](https://github.com/tjx666/install-dependency-code-action/issues) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

![screenshot](./assets/Screenshot%20from%202024-10-10%2002-48-40.png)

</div>

## Features

Detects an import of a missing module and offers to install it via npm/yarn/pnpm using the quick fix command.

Open up this link for video showing the extension in action: 

https://github.com/user-attachments/assets/73b502f8-a462-483a-b783-d2eed3a10690

 - shows error info when install fails
 - shows success when install is succesful


## Development

Install dependencies by:

```shell
pnpm install
```


Then run and debug extension like in [official documentation](https://code.visualstudio.com/api/get-started/your-first-extension)

## TODO

- add ability to install all missing dependencies at once