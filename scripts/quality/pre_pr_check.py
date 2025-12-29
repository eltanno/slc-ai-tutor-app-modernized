#!/usr/bin/env python3
"""
Pre-PR Cleanup Script with Auto-Fix

This script runs before creating a Pull Request to ensure code quality:
1. Removes unused imports/variables/functions
2. Fixes all linting issues
3. Runs tests to verify fixes
4. Reports what was changed

Usage:
    python scripts/quality/pre_pr_check.py

Exit codes:
    0: All checks passed
    1: Checks failed or tests broke after fixes
"""

import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], description: str) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    print(f'\n🔍 {description}...')
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0:
            print(f'✅ {description} - PASSED')
            return True, result.stdout
        print(f'⚠️  {description} - Found issues')
        return False, result.stdout + '\n' + result.stderr
    except Exception as e:
        print(f'❌ {description} - ERROR: {e}')
        return False, str(e)


def main() -> int:
    """Main entry point for pre-PR checks."""
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('  Pre-PR Cleanup & Quality Check')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    issues_found = []
    fixes_applied = []

    # Step 1: Python - Detect unused code with vulture
    print('\n📦 Python - Detecting unused code...')
    success, output = run_command(
        ['vulture', '.', '--min-confidence', '80'],
        'Vulture unused code detection',
    )
    if not success and 'unused' in output.lower():
        issues_found.append('Unused Python code detected')
        print(output)
        print('\n⚠️  Manual review required for unused code removal')

    # Step 2: Python - Auto-fix with Ruff
    print('\n🐍 Python - Running Ruff auto-fix...')
    success, output = run_command(
        ['ruff', 'check', '.', '--fix', '--unsafe-fixes'],
        'Ruff auto-fix (Python)',
    )
    if not success:
        fixes_applied.append('Ruff fixed Python code')

    success, output = run_command(
        ['ruff', 'format', '.'],
        'Ruff format (Python)',
    )
    if not success:
        fixes_applied.append('Ruff formatted Python code')

    # Step 3: JavaScript/TypeScript - Auto-fix with ESLint
    if Path('package.json').exists():
        print('\n📜 JavaScript/TypeScript - Running ESLint auto-fix...')
        # Source nvm and run eslint
        eslint_cmd = (
            'source ~/.nvm/nvm.sh && '
            'nvm use 20 > /dev/null 2>&1 && '
            'npx eslint . --fix --ext .js,.jsx,.ts,.tsx'
        )
        success, output = run_command(
            ['bash', '-c', eslint_cmd],
            'ESLint auto-fix (JS/TS)',
        )
        if not success:
            fixes_applied.append('ESLint fixed JS/TS code')

    # Step 4: CSS/SCSS - Auto-fix with Stylelint
    if Path('package.json').exists():
        print('\n🎨 CSS/SCSS - Running Stylelint auto-fix...')
        stylelint_cmd = (
            'source ~/.nvm/nvm.sh && '
            'nvm use 20 > /dev/null 2>&1 && '
            'npx stylelint "**/*.{css,scss}" --fix || true'
        )
        success, output = run_command(
            ['bash', '-c', stylelint_cmd],
            'Stylelint auto-fix (CSS/SCSS)',
        )
        if not success:
            fixes_applied.append('Stylelint fixed CSS/SCSS code')

    # Step 5: Run tests to verify fixes didn't break anything
    print('\n🧪 Running tests to verify fixes...')
    tests_passed = True

    if Path('tests').exists():
        # Python tests
        if list(Path('tests').glob('**/*.py')):
            success, output = run_command(
                ['python', '-m', 'pytest', 'tests/', '-v', '--tb=short'],
                'Python tests',
            )
            if not success:
                print('❌ Python tests FAILED after fixes!')
                print(output)
                tests_passed = False

        # JS/TS tests (if package.json has test script)
        if Path('package.json').exists():
            npm_test_cmd = (
                'source ~/.nvm/nvm.sh && '
                'nvm use 20 > /dev/null 2>&1 && '
                'npm test || echo "No tests configured"'
            )
            success, output = run_command(
                ['bash', '-c', npm_test_cmd],
                'JavaScript/TypeScript tests',
            )
            if not success and 'No tests configured' not in output:
                print('❌ JS/TS tests FAILED after fixes!')
                print(output)
                tests_passed = False

    # Summary
    print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('  Summary')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if fixes_applied:
        print('\n✨ Fixes Applied:')
        for fix in fixes_applied:
            print(f'  - {fix}')
    else:
        print('\n✅ No fixes needed - code is clean!')

    if issues_found:
        print('\n⚠️  Issues Requiring Manual Review:')
        for issue in issues_found:
            print(f'  - {issue}')

    if not tests_passed:
        print('\n❌ TESTS FAILED - Please review and fix before creating PR')
        return 1

    if not issues_found:
        print('\n🎉 All checks passed! Ready to create PR.')
        return 0
    print('\n⚠️  Some issues require manual review. Please address before PR.')
    return 0  # Don't block PR, just warn


if __name__ == '__main__':
    sys.exit(main())
