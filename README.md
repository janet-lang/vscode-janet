# Janet language support for Visual Studio Code

## Features

- Syntax highlighting
- Eval expression ```alt+e```
- Eval file ```alt+l```
- Structural editing via ParEdit-style Sexp commands

## Notes

This extension is not published yet. To install proceed to local install section.

## Local install
```
cd ~/.vscode/extensions
git clone https://github.com/janet-lang/vscode-janet.git
```

## Debug this extension

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View in VS Code. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
