# Installing Graphviz

The `diagrams` library requires Graphviz to be installed as a **system package** (not just the Python package).

## Windows Installation

### Option 1: Using Winget (Recommended)
```powershell
winget install Graphviz.Graphviz -i
```

### Option 2: Using Chocolatey
```powershell
choco install graphviz
```

### Option 3: Manual Installation
1. Download Graphviz from: https://graphviz.org/download/
2. Run the installer
3. **Important**: Add Graphviz to your PATH or restart your terminal

After installation, **restart your terminal** or add Graphviz to your PATH.

## Verify Installation

After installing Graphviz, verify it's working:

```powershell
dot -V
```

You should see something like: `dot - graphviz version 2.x.x`

## Troubleshooting

If you still get errors after installing:
1. Close and reopen your terminal/PowerShell
2. Verify Graphviz is in your PATH: `where dot`
3. If not found, manually add Graphviz `bin` folder to your PATH:
   - Usually located at: `C:\Program Files\Graphviz\bin`
   - Add it to your system PATH environment variable

