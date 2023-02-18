# Janet language support for Visual Studio Code

## Features

- Syntax highlighting
- Eval expression ```alt+e```
- Eval file ```alt+l```

## Notes

This extension is not published yet. To install proceed to local install section.

## Local install
```
# First, make sure you have Node.js version 14 or greater installed. 

# Clone the extension into vscode's extension directory.
cd ~/.vscode/extensions
git clone https://github.com/janet-lang/vscode-janet.git
cd vscode-janet

# Install vscode-janet dependencies.
npm install

# Generate the vcode extension (VSIX) file using vsce. 
npx vsce package

# Finally install the extension.
code --install-extension vscode-janet-0.0.2.vsix
```

## Debug this extension

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View in VS Code. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
