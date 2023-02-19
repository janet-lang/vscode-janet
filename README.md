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

# Clone the extension.
git clone https://github.com/janet-lang/vscode-janet.git
cd vscode-janet

# Install vscode-janet dependencies.
npm install

# Generate the vscode extension (VSIX) file using vsce. 
npx vsce package

# Install the extension.
code --install-extension vscode-janet-0.0.2.vsix

# Finally reload the vscode window (cmd + shift + P > Developer: Reload Window).
```

Alternatively you can clone the extension right into vscode's extention directory. This is easier, but can be unreliable as vscode will sometimes clean up the extension directory and remove vscode-janet.
```
# Clone the extension.
cd ~/.vscode/extensions
git clone https://github.com/janet-lang/vscode-janet.git

# Force vscode to regenerate the extensions.json file.
mv extensions.json /tmp/ 

# Finally reload the vscode window (cmd + shift + P > Developer: Reload Window).

# If you're finding that vscode isn't loading the extension, you can force it to
# regenerate the extensions.json file by removing ~/.vscode/extensions/extensions.json.
```


## Debug this extension

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View in VS Code. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
