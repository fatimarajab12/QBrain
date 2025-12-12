"""
Generate all diagrams at once
"""
import os
import subprocess

diagram_files = [
    "01-file-upload-flow.py",
    "02-feature-extraction-flow.py",
    "03-test-case-generation-flow.py",
    "04-system-architecture.py",
    "05-complete-workflow.py",
    "07-rag-query-flow.py"
]

print("Generating all diagrams...")
print("=" * 50)

for diagram_file in diagram_files:
    if os.path.exists(diagram_file):
        print(f"Generating {diagram_file}...")
        try:
            result = subprocess.run(
                ["python", diagram_file],
                capture_output=True,
                text=True,
                check=True
            )
            print(f"✓ {diagram_file} generated successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Error generating {diagram_file}: {e.stderr}")
    else:
        print(f"✗ {diagram_file} not found")

print("=" * 50)
print("Done! Check the output PNG and SVG files.")

