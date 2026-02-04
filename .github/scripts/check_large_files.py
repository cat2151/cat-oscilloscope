#!/usr/bin/env python3
"""
大きなファイル検出スクリプト
Detects source files exceeding configured line count threshold
"""

import os
import sys
import glob
import tomllib
from pathlib import Path
from typing import List, Dict, Any
import json

# Constants
TITLE_PATTERN_FALLBACK_LENGTH = 20  # Length to use when extracting title pattern if no separator found


def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from TOML file"""
    try:
        with open(config_path, 'rb') as f:
            return tomllib.load(f)
    except FileNotFoundError:
        print(f"Error: Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    except PermissionError:
        print(f"Error: Permission denied when reading config file: {config_path}", file=sys.stderr)
        sys.exit(1)
    except tomllib.TOMLDecodeError as e:
        print(f"Error: Failed to parse TOML config file {config_path}: {e}", file=sys.stderr)
        sys.exit(1)
    except OSError as e:
        print(f"Error: Failed to read config file {config_path}: {e}", file=sys.stderr)
        sys.exit(1)


def count_lines(file_path: str) -> int:
    """Count lines in a file efficiently"""
    try:
        with open(file_path, 'rb') as f:
            # Count newlines in chunks for efficiency
            count = 0
            chunk_size = 1024 * 1024  # 1MB chunks
            last_byte = None
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                count += chunk.count(b'\n')
                # Remember the last byte of the last non-empty chunk
                last_byte = chunk[-1]
            # Handle empty files and files not ending with newline
            if last_byte is None:
                # Empty file
                return 0
            if last_byte != b'\n'[0]:
                # File doesn't end with newline, add 1
                count += 1
            return count
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
        return 0


def should_exclude(file_path: str, exclude_patterns: List[str], exclude_files: List[str]) -> bool:
    """Check if file should be excluded"""
    # Check exclude_files (exact match)
    if file_path in exclude_files:
        return True
    
    # Check exclude_patterns (glob match)
    for pattern in exclude_patterns:
        if Path(file_path).match(pattern):
            return True
    
    return False


def find_large_files(config: Dict[str, Any], repo_root: str) -> List[Dict[str, Any]]:
    """Find files exceeding line count threshold"""
    # Safely access configuration sections
    settings = config.get('settings') or {}
    scan = config.get('scan') or {}
    
    # Validate required setting
    if 'max_lines' not in settings:
        print("Error: Missing required configuration field 'settings.max_lines' in TOML file.", file=sys.stderr)
        sys.exit(1)
    
    max_lines = settings['max_lines']
    include_patterns = scan.get('include_patterns', [])
    exclude_patterns = scan.get('exclude_patterns', [])
    exclude_files = scan.get('exclude_files', [])
    
    large_files = []
    
    # Change to repo root for glob patterns
    original_cwd = os.getcwd()
    os.chdir(repo_root)
    
    try:
        # Collect all files matching include patterns
        all_files = set()
        for pattern in include_patterns:
            matched = glob.glob(pattern, recursive=True)
            all_files.update(matched)
        
        # Check each file
        for file_path in sorted(all_files):
            # Skip excluded files
            if should_exclude(file_path, exclude_patterns, exclude_files):
                continue
            
            # Count lines
            line_count = count_lines(file_path)
            
            # Check threshold
            if line_count > max_lines:
                large_files.append({
                    'path': file_path,
                    'lines': line_count,
                })
        
    finally:
        os.chdir(original_cwd)
    
    return large_files


def generate_issue_body(large_files: List[Dict[str, Any]], config: Dict[str, Any]) -> str:
    """Generate GitHub issue body"""
    max_lines = config['settings']['max_lines']
    
    body = f"以下のファイルが{max_lines}行を超えています。リファクタリングを検討してください。\n\n"
    body += "## 検出されたファイル\n\n"
    body += "| ファイル | 行数 | 超過行数 |\n"
    body += "|---------|------|----------|\n"
    
    for file_info in sorted(large_files, key=lambda x: x['lines'], reverse=True):
        path = file_info['path']
        lines = file_info['lines']
        over = lines - max_lines
        body += f"| `{path}` | {lines} | +{over} |\n"
    
    body += f"\n## 推奨事項\n\n"
    body += "1. ファイルを機能ごとに分割する\n"
    body += "2. 共通ロジックを別モジュールに抽出する\n"
    body += "3. クラスやインターフェースを適切なサイズに保つ\n"
    body += "\n---\n"
    body += "*このissueは自動生成されました*"
    
    return body


def create_output_files(large_files: List[Dict[str, Any]], config: Dict[str, Any], output_dir: str):
    """Create output files for GitHub Actions"""
    os.makedirs(output_dir, exist_ok=True)
    
    # Write large files list
    list_file = os.path.join(output_dir, 'large_files.txt')
    with open(list_file, 'w', encoding='utf-8') as f:
        for file_info in large_files:
            f.write(f"{file_info['path']}: {file_info['lines']} lines\n")
    
    # Write issue body
    issue_body = generate_issue_body(large_files, config)
    body_file = os.path.join(output_dir, 'issue_body.txt')
    with open(body_file, 'w', encoding='utf-8') as f:
        f.write(issue_body)
    
    # Write issue title
    title_template = config.get('settings', {}).get('issue_title', '大きなファイルの検出: {count}個のファイルが{max_lines}行を超えています')
    title = title_template.format(
        count=len(large_files),
        max_lines=config['settings']['max_lines']
    )
    title_file = os.path.join(output_dir, 'issue_title.txt')
    with open(title_file, 'w', encoding='utf-8') as f:
        f.write(title)
    
    # Write title pattern for search (extract key phrase from title)
    title_pattern_file = os.path.join(output_dir, 'issue_title_pattern.txt')
    with open(title_pattern_file, 'w', encoding='utf-8') as f:
        # Extract first meaningful part before colon as search pattern
        pattern = title.split(':')[0] if ':' in title else title[:TITLE_PATTERN_FALLBACK_LENGTH]
        f.write(pattern)
    
    # Write labels
    labels = ','.join(config.get('settings', {}).get('issue_labels', ['refactoring', 'code-quality', 'automated']))
    labels_file = os.path.join(output_dir, 'issue_labels.txt')
    with open(labels_file, 'w', encoding='utf-8') as f:
        f.write(labels)
    
    # Write count for GitHub Actions output
    count_file = os.path.join(output_dir, 'file_count.txt')
    with open(count_file, 'w', encoding='utf-8') as f:
        f.write(str(len(large_files)))
    
    # Write summary JSON
    summary = {
        'count': len(large_files),
        'max_lines': config['settings']['max_lines'],
        'files': large_files
    }
    json_file = os.path.join(output_dir, 'summary.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)


def main():
    """Main function"""
    # Get paths
    repo_root = os.getenv('GITHUB_WORKSPACE', os.getcwd())
    config_path = os.path.join(repo_root, '.github', 'check-large-files.toml')
    output_dir = os.getenv('OUTPUT_DIR', '/tmp/check-large-files-output')
    
    # Load config
    print(f"Loading config from {config_path}")
    config = load_config(config_path)
    
    # Find large files
    print(f"Scanning files in {repo_root}")
    large_files = find_large_files(config, repo_root)
    
    # Report results
    print(f"\nFound {len(large_files)} files exceeding {config['settings']['max_lines']} lines:")
    for file_info in large_files:
        print(f"  {file_info['path']}: {file_info['lines']} lines")
    
    # Create output files
    create_output_files(large_files, config, output_dir)
    print(f"\nOutput files created in {output_dir}")
    
    # Exit with success (detection is not an error condition)
    sys.exit(0)


if __name__ == '__main__':
    main()
