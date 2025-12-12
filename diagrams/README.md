# QBrain UML Diagrams

This folder contains diagrams for the QBrain system in two formats:
1. **PlantUML** (`.puml` files) - Text-based diagram definitions
2. **Python Diagrams** (`.py` files) - Code-based diagram generation using the `diagrams` library

## PlantUML Diagrams

### Viewing PlantUML Diagrams

#### Online (Recommended)
1. Go to [PlantText.com](https://www.planttext.com/)
2. Copy the content of any `.puml` file
3. Paste it into the PlantText editor
4. The diagram will be rendered automatically

#### VS Code
1. Install the "PlantUML" extension
2. Open any `.puml` file
3. Press `Alt+D` (or `Cmd+D` on Mac) to preview

## Python Diagrams

### Installation

**Prerequisites:**
- Python 3.7 or higher
- Graphviz (required for rendering)

**Install Graphviz (System Package):**

⚠️ **IMPORTANT**: You need to install Graphviz as a system package, not just the Python package!

```bash
# Windows (Chocolatey)
choco install graphviz

# Windows (Winget)
winget install Graphviz.Graphviz -i

# Windows (Manual)
# Download from: https://graphviz.org/download/
# After installation, add Graphviz to your PATH or restart your terminal

# macOS (Homebrew)
brew install graphviz

# Linux (Ubuntu/Debian)
sudo apt-get install graphviz
```

**Note**: After installing Graphviz, you may need to restart your terminal or add it to your PATH.

**Install Python dependencies:**

```bash
# Install from requirements.txt
pip install -r requirements.txt

# Or install directly
pip install diagrams graphviz
```

### Generate Diagrams

Run any Python file to generate the corresponding diagram:

```bash
# Generate individual diagrams
python 01-file-upload-flow.py
python 02-feature-extraction-flow.py
python 03-test-case-generation-flow.py
python 04-system-architecture.py
python 05-complete-workflow.py
python 07-rag-query-flow.py

# Generate all diagrams at once
python generate_all.py
```

The diagrams will be saved as **PNG and SVG** files in the same directory (e.g., `01-file-upload-flow.png` and `01-file-upload-flow.svg`).

### Features

All Python diagrams include:
- **Blue color theme** matching the PlantUML diagrams
- **Multiple output formats** (PNG and SVG)
- **Custom styling** with rounded corners and shadows
- **Clear step numbering** for easy flow tracking
- **Professional appearance** with consistent fonts and colors

### Available Diagrams:

1. **`01-file-upload-flow.py`** - File Upload Flow
   - Shows how SRS documents are processed and stored

2. **`02-feature-extraction-flow.py`** - Feature Extraction Flow
   - RAG-based feature extraction from SRS documents

3. **`03-test-case-generation-flow.py`** - Test Case Generation Flow
   - AI-powered test case generation for features

4. **`04-system-architecture.py`** - System Architecture
   - Complete system overview with all components

5. **`05-complete-workflow.py`** - Complete Workflow
   - End-to-end process flow from project creation to test cases

6. **`07-rag-query-flow.py`** - RAG Query Flow
   - Chatbot question answering system

## Customization

### Python Diagrams Customization

You can customize the diagrams by modifying the Python files:

```python
# Change direction
with Diagram("Title", direction="TB"):  # Top to Bottom
with Diagram("Title", direction="LR"):  # Left to Right

# Change output format (single or multiple)
with Diagram("Title", outformat="png"):  # PNG only
with Diagram("Title", outformat=["png", "svg"]):  # PNG and SVG

# Customize appearance
graph_attr = {
    "fontsize": "16",
    "fontname": "Arial",
    "bgcolor": "white"
}

node_attr = {
    "fontsize": "12",
    "fontcolor": "#1565C0",
    "fillcolor": "#E3F2FD",
    "color": "#1976D2"
}

edge_attr = {
    "color": "#1976D2",
    "penwidth": "2"
}

with Diagram("Title", 
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    # Your diagram code
```

### Color Scheme

All diagrams use a consistent blue color scheme:
- **Background**: `#E3F2FD` (Light Blue)
- **Border**: `#1976D2` (Blue)
- **Text**: `#1565C0` (Dark Blue)
- **Database**: `#BBDEFB` (Lighter Blue)

### PlantUML Diagrams

Edit the `.puml` files directly to customize colors, shapes, and layout.

## Notes:

- **PlantUML**: Better for text-based editing and version control
- **Python Diagrams**: Better for programmatic generation and automation
- Both formats produce similar visual results
- Choose the format that best fits your workflow

---

**Created by AI Assistant**
