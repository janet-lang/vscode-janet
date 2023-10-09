# Janet language support for Visual Studio Code

This extension adds language support and some IDE-lite editor features for the [Janet](https://www.janet-lang.org) programming language to [VS Code](https://code.visualstudio.com/).

Just starting with Janet? See the official language introduction [here](https://www.janet-lang.org/docs/index.html).

## Features

- `.janet` file type support and syntax highlighting for Janet files
- Create a Janet REPL session in the integrated terminal (`Janet: Start REPL` in the Command Palette)
  - Evaluate expressions from any open `.janet` file (with ```alt+e```) or load the entire open file into the REPL (with ```alt+l```), creating a new one if none is currently active
- Auto-format Janet code while typing, or format current form on command (with `Tab`)
- Structural editing and navigation using ParEdit-style Sexp commands
  - `Ctrl+Left/Right` to move cursor by S-Exp
  - `Alt+Up/Down` to drag S-Exp forward/backward
  - "Slurp" (extend parentheses), "Barf" (shrink parentheses), and other PareEdit commands (see [this visual guide to ParEdit on the Calva website](https://calva.io/paredit/) for more info, most of which applies without modification to this extension too)
- Language Server Protocol via embedded [Janet LSP](https://www.github.com/CFiggers/janet-lsp)
  - Inline compiler error underlining (glitchy on Windows at the moment)
  - Function and macro autocomplete
  - On-hover symbol definitions

More coming soon!

# How to Install

## VS Code Extension Marketplace
-Navigate to the VS Code Extension marketplace within VS Code.
-Search for "vscode-hy (hylang official)" and install as usual.

## Local Install
- Navigate to your local .vscode (or .vscodium) extension directory (e.g. $ cd ~/.vscode/extensions)
- Clone this repo within that directory (e.g. git clone https://www.github.com/hylang/vscode-hy)
- Reload or relaunch any open VS Code/VS Codium windows

# Contributing

Issues and PRs are welcome!

# Prior Art

Huge portions of this extension are remixed from other open source projects, including:

- Janet's official VS Code Extension: [vscode-janet](https://www.github.com/janet-lang/vscode-janet), MIT License, Copyright (c) 2020 Calvin Rose and contributors
- [Calva: A Clojure & ClojureScript IDE in Visual Studio Code](https://www.github.com/BetterThanTomorrow/calva), MIT License, Parts of the software are Copyright (c) 2016-2018 Stian Sivertsen; Other parts are Copyright (c) 2018 -> Better than Tomorrow
