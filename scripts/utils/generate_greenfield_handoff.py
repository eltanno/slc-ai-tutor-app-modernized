#!/usr/bin/env python3
"""
generate_greenfield_handoff.py - Generate Cursor handoff for greenfield projects

Usage: python generate_greenfield_handoff.py <template_path> <variables_json_file>
"""

import json
import sys
from pathlib import Path


def generate_handoff(template_path: Path, output_path: Path, variables: dict) -> None:
    """Generate handoff document by replacing placeholders."""
    content = template_path.read_text()

    # Replace all placeholders
    for key, value in variables.items():
        placeholder = f'{{{{{key}}}}}'
        content = content.replace(placeholder, str(value))

    # Write output
    output_path.write_text(content)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(
            'Usage: python generate_greenfield_handoff.py '
            '<template_path> <variables_json_file>',
        )
        sys.exit(1)

    template_path = Path(sys.argv[1])
    variables_file = Path(sys.argv[2])
    output_path = Path('tmp/cursor-handoff-greenfield.md')

    # Read variables from file
    variables = json.loads(variables_file.read_text())

    generate_handoff(template_path, output_path, variables)
    print(f'✅ Generated: {output_path}')
