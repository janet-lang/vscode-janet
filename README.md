# Janet language support for Visual Studio Code

## Features

- Syntax highlighting
- Eval expression: `Alt+E`
- Eval file: `Alt+L`

## Installation

### From the VS Code Marketplace

The extension is available [here](https://marketplace.visualstudio.com/items?itemName=janet-lang.vscode-janet).

To install, launch VS Code Quick Open (`Cmd+P`), paste the following command, and press enter.

```
ext install janet-lang.vscode-janet
```

Alternatively, run the following in a terminal.

```shell
code --install-extension janet-lang.vscode-janet
```

### From source

```shell
# First, make sure you have Node.js version 14 or greater installed. 

# Clone the extension.
git clone https://github.com/janet-lang/vscode-janet.git
cd vscode-janet

# Install vscode-janet's dependencies.
npm install

# Generate the VS Code extension (VSIX) file using vsce. 
npx vsce package

# Install the extension.
code --install-extension vscode-janet-0.0.2.vsix

# Finally, reload the VS Code window (Cmd+Shift+P > Developer: Reload Window).
```

Alternatively, you can clone the extension right into VS Code's extension directory. This is easier, but can be unreliable as VS Code will sometimes clean up the extension directory and remove vscode-janet.

```shell
# Clone the extension.
cd ~/.vscode/extensions
git clone https://github.com/janet-lang/vscode-janet.git

# Force VS Code to regenerate the extensions.json file.
mv extensions.json /tmp/ 

# Finally, reload the VS Code window (Cmd+Shift+P > Developer: Reload Window).

# If you're finding that VS Code isn't loading the extension, you can force it to
# regenerate the extensions.json file by removing ~/.vscode/extensions/extensions.json.
```


## Debug this extension

- Run `npm install` in a terminal to install dependencies
- Run the `Run Extension` target in the Debug View in VS Code. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
