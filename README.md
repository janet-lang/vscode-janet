# Janet language support for Visual Studio Code

## Features

- Syntax highlighting

## Notes

This extension is not published yet. To install proceed to local install section.

## Local install

To load an extension, you need to copy the files to your VS Code extensions folder .vscode/extensions. Depending on your platform, it is located in the following folders:

- Windows %USERPROFILE%\.vscode\extensions
- macOS ~/.vscode/extensions
- Linux ~/.vscode/extensions

## Debug this extention

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
