// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const ESC = '\u001b';

const ANSI = {
	reset: `${ESC}[0m`,
	bold: `${ESC}[1m`,
	dim: `${ESC}[2m`,
	red: `${ESC}[31m`,
	green: `${ESC}[32m`,
	yellow: `${ESC}[33m`,
	blue: `${ESC}[34m`,
	magenta: `${ESC}[35m`,
	cyan: `${ESC}[36m`,
	boldRed: `${ESC}[1;31m`,
	boldGreen: `${ESC}[1;32m`,
	boldYellow: `${ESC}[1;33m`,
	boldCyan: `${ESC}[1;36m`,
};

// Approximate Git Bash (mintty/xterm-like) ANSI palette
const GIT_BASH_ANSI_PALETTE = {
	'terminal.ansiBlack': '#000000',
	'terminal.ansiRed': '#bb0000',
	'terminal.ansiGreen': '#00bb00',
	'terminal.ansiYellow': '#bbbb00',
	'terminal.ansiBlue': '#0000bb',
	'terminal.ansiMagenta': '#ff00ff',
	'terminal.ansiCyan': '#00bbbb',
	'terminal.ansiWhite': '#eeeeee',
	'terminal.ansiBrightBlack': '#555555',
	'terminal.ansiBrightRed': '#ff5555',
	'terminal.ansiBrightGreen': '#00ff00',
	'terminal.ansiBrightYellow': '#ffff55',
	'terminal.ansiBrightBlue': '#5555ff',
	'terminal.ansiBrightMagenta': '#ff55ff',
	'terminal.ansiBrightCyan': '#55ffff',
	'terminal.ansiBrightWhite': '#ffffff',
};

// Authors should use ```git for Git Bash-like outputs.
// We still support a few aliases for convenience.
const GIT_OUTPUT_LANG_ALIASES = new Set(['git', 'git-bash', 'gitbash', 'git-output', 'git-session']);

// Optional auto-detection for untyped output blocks (kept conservative on purpose).
const MAYBE_GIT_OUTPUT_LANGS = new Set(['text', 'plaintext', 'console']);

const GIT_STATUS_LONG_MARKERS = [
	'Changes to be committed:',
	'Changes not staged for commit:',
	'Untracked files:',
	'Unmerged paths:',
	'On branch ',
	'Your branch is ',
	'You have unmerged paths.',
	'nothing to commit',
];

function isPromptLine(trimmedLine) {
	return trimmedLine.startsWith('$') || trimmedLine.startsWith('>');
}

function replaceVisibleAnsiEscapes(text) {
	return text
		.replace(/\\u001[bB]/g, ESC)
		.replace(/\\x1[bB]/g, ESC)
		.replace(/\\033/g, ESC)
		.replace(/\\e/g, ESC);
}

function isCommentLikeLine(line) {
	const trimmed = line.trimStart();
	return (
		trimmed.startsWith('#') ||
		trimmed.startsWith('//') ||
		trimmed.startsWith('<!--') ||
		trimmed.startsWith('/*')
	);
}

function looksLikeGitCommitTemplate(code) {
	return code.includes('Please enter the commit message for your changes.');
}

function looksLikeGitStatusLongOutput(code) {
	if (looksLikeGitCommitTemplate(code)) return false;

	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return GIT_STATUS_LONG_MARKERS.some((marker) => trimmed.startsWith(marker));
	});
}

function looksLikeGitStatusShortOutput(code) {
	if (looksLikeGitCommitTemplate(code)) return false;

	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^[ MADRCU?]{2}\s+\S+/.test(trimmed);
	});
}

function looksLikeGitDiffOutput(code) {
	const lines = code.split(/\r?\n/);
	let hasDiffGit = false;
	let hasFileMarkers = false;
	let hasHunk = false;

	for (const line of lines) {
		if (isCommentLikeLine(line)) continue;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (trimmed.startsWith('diff --git ')) hasDiffGit = true;
		if (trimmed.startsWith('--- ') || trimmed.startsWith('+++ ')) hasFileMarkers = true;
		if (trimmed.startsWith('@@')) hasHunk = true;
	}

	return hasDiffGit || (hasFileMarkers && hasHunk);
}

function looksLikeGitBranchOutput(code) {
	const lines = code.split(/\r?\n/);
	let foundBranchLine = false;
	let foundCurrentBranch = false;

	for (const raw of lines) {
		if (isCommentLikeLine(raw)) continue;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (/^\*\s+\S+/.test(trimmed)) {
			foundBranchLine = true;
			foundCurrentBranch = true;
			continue;
		}

		// Typical `git branch` output indents non-current branches by two spaces.
		if (/^\s{2,}\S+/.test(raw)) {
			foundBranchLine = true;
			continue;
		}

		return false;
	}

	return foundBranchLine && foundCurrentBranch;
}

function looksLikeGitTransportErrorOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return (
			trimmed.startsWith('fatal:') ||
			trimmed.startsWith('error:') ||
			trimmed.startsWith('warning:') ||
			trimmed.startsWith('hint:') ||
			trimmed.includes('[rejected]') ||
			trimmed.includes('CONFLICT')
		);
	});
}

function looksLikeGitMergeOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return (
			trimmed.startsWith('Updating ') ||
			trimmed === 'Fast-forward' ||
			trimmed.startsWith('Merge made by') ||
			trimmed.startsWith('Auto-merging ') ||
			trimmed.startsWith('Automatic merge failed;') ||
			trimmed.startsWith('Already up to date.') ||
			trimmed.includes('CONFLICT')
		);
	});
}

function looksLikeGitLogOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^commit\s+[0-9a-f]{7,}\b/i.test(trimmed);
	});
}

function looksLikeGitReflogOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^[0-9a-f]{7,}\b/i.test(trimmed) && trimmed.includes('HEAD@{');
	});
}

function looksLikeGitStashListOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^stash@\{\d+\}:/i.test(trimmed);
	});
}

function looksLikeGitBlameOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^[0-9a-f]{7,}\s+\([^)]*\d{4}-\d{2}-\d{2}[^)]*\)\s+/.test(trimmed);
	});
}

function looksLikeGitBisectOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return (
			trimmed.startsWith('Bisecting: ') ||
			trimmed.includes('first bad commit') ||
			/^\[[0-9a-f]{5,}\.{3}\]\s+/.test(trimmed)
		);
	});
}

function looksLikeGitRemoteVerboseOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^\S+\s+\S+\s+\((fetch|push)\)\s*$/i.test(trimmed);
	});
}

function looksLikeGitCheckIgnoreVerboseOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^(?:[^\s:]+\.)?gitignore:\d+:/i.test(trimmed);
	});
}

function looksLikeGitCountObjectsOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^(count|size|in-pack|packs|size-pack|prune-packable|garbage|size-garbage):\s+/i.test(trimmed);
	});
}

function looksLikeGitVersionOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^git version\s+\d+/i.test(trimmed);
	});
}

function looksLikeGitConfigUsageOutput(code) {
	const lines = code.split(/\r?\n/);
	return lines.some((line) => {
		if (isCommentLikeLine(line)) return false;
		const trimmed = line.trimStart();
		if (!trimmed || isPromptLine(trimmed)) return false;
		return /^usage:\s+git\s+/i.test(trimmed);
	});
}

function colorizeGitStatusOutput(codeBlock) {
	const green = ANSI.green;
	const red = ANSI.red;
	const reset = ANSI.reset;

	const code = codeBlock.code;
	const isGitStatusLong = looksLikeGitStatusLongOutput(code);
	const isGitStatusShort = looksLikeGitStatusShortOutput(code);

	let currentSectionColor = null;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();

		// Don't touch prompts / commands in mixed "session" blocks
		if (!trimmed || isPromptLine(trimmed)) continue;

		// Short format: git status -s
		if (isGitStatusShort && /^[ MADRCU?]{2}\s+\S+/.test(trimmed)) {
			const status = trimmed.slice(0, 2);
			const isUntracked = status === '??';
			const workingTreeDirty = status[1] !== ' ';
			const indexDirty = status[0] !== ' ';
			const color = isUntracked || workingTreeDirty ? red : indexDirty ? green : null;

			if (color) {
				const indentLen = raw.length - trimmed.length;
				const indent = raw.slice(0, indentLen);
				const coloredLine = `${indent}${color}${trimmed}${reset}`;
				line.editText(0, raw.length, coloredLine);
			}

			continue;
		}

		// Clean working tree messages
		if (trimmed.startsWith('nothing to commit') || trimmed.startsWith('nothing added to commit')) {
			line.editText(0, raw.length, `${green}${raw}${reset}`);
			continue;
		}

		if (!isGitStatusLong) continue;

		// Long format: section headers & file lists
		if (trimmed.startsWith('Changes to be committed:')) currentSectionColor = green;
		else if (
			trimmed.startsWith('Changes not staged for commit:') ||
			trimmed.startsWith('Untracked files:') ||
			trimmed.startsWith('Unmerged paths:')
		)
			currentSectionColor = red;

		if (!currentSectionColor) continue;

		const isSectionHeader =
			trimmed.startsWith('Changes to be committed:') ||
			trimmed.startsWith('Changes not staged for commit:') ||
			trimmed.startsWith('Untracked files:') ||
			trimmed.startsWith('Unmerged paths:');
		const isIndented = raw.startsWith(' ') || raw.startsWith('\t');
		const isHintOrFileLine =
			trimmed.startsWith('(') ||
			trimmed.startsWith('both modified:') ||
			trimmed.startsWith('new file:') ||
			trimmed.startsWith('modified:') ||
			trimmed.startsWith('deleted:') ||
			trimmed.startsWith('renamed:');

		if (isSectionHeader || isIndented || isHintOrFileLine) {
			line.editText(0, raw.length, `${currentSectionColor}${raw}${reset}`);
		}
	}
}

function colorizeGitDiffOutput(codeBlock) {
	const meta = ANSI.boldYellow;
	const hunk = ANSI.boldCyan;
	const add = ANSI.green;
	const del = ANSI.red;
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const isAddedLine = trimmed.startsWith('+') && !trimmed.startsWith('+++');
		const isDeletedLine = trimmed.startsWith('-') && !trimmed.startsWith('---');

		if (
			trimmed.startsWith('diff --git ') ||
			trimmed.startsWith('index ') ||
			trimmed.startsWith('new file mode ') ||
			trimmed.startsWith('deleted file mode ') ||
			trimmed.startsWith('similarity index ') ||
			trimmed.startsWith('rename from ') ||
			trimmed.startsWith('rename to ') ||
			trimmed.startsWith('--- ') ||
			trimmed.startsWith('+++ ') ||
			trimmed.startsWith('Binary files ') ||
			trimmed.startsWith('GIT binary patch')
		) {
			line.editText(0, raw.length, `${meta}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('@@')) {
			line.editText(0, raw.length, `${hunk}${raw}${reset}`);
			continue;
		}

		if (isAddedLine) {
			line.editText(0, raw.length, `${add}${raw}${reset}`);
			continue;
		}

		if (isDeletedLine) {
			line.editText(0, raw.length, `${del}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('\\ No newline at end of file')) {
			line.editText(0, raw.length, `${meta}${raw}${reset}`);
		}
	}
}

function colorizeGitBranchOutput(codeBlock) {
	const green = ANSI.green;
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (trimmed.startsWith('* ')) {
			line.editText(0, raw.length, `${green}${raw}${reset}`);
		}
	}
}

function colorizeGitTransportErrorOutput(codeBlock) {
	const fatal = ANSI.boldRed;
	const err = ANSI.red;
	const warn = ANSI.boldYellow;
	const hint = ANSI.cyan;
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (trimmed.startsWith('fatal:')) {
			line.editText(0, raw.length, `${fatal}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('error:')) {
			line.editText(0, raw.length, `${err}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('warning:')) {
			line.editText(0, raw.length, `${warn}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('hint:')) {
			line.editText(0, raw.length, `${hint}${raw}${reset}`);
			continue;
		}

		if (trimmed.includes('[rejected]') || trimmed.startsWith('! ') || trimmed.includes('CONFLICT')) {
			line.editText(0, raw.length, `${err}${raw}${reset}`);
		}
	}
}

function getColoredDiffStatLine(raw) {
	const match = raw.match(/^(\s*)(.+?)\s+\|\s+(\d+)\s+([+-]+)\s*$/);
	if (!match) return;
	const [, indent, file, count, graph] = match;

	const countColored = `${ANSI.yellow}${count}${ANSI.reset}`;
	let graphColored = graph;

	if (graph.includes('+') && !graph.includes('-')) {
		graphColored = `${ANSI.green}${graph}${ANSI.reset}`;
	} else if (graph.includes('-') && !graph.includes('+')) {
		graphColored = `${ANSI.red}${graph}${ANSI.reset}`;
	} else {
		graphColored = graph
			.replace(/\+/g, `${ANSI.green}+${ANSI.reset}`)
			.replace(/-/g, `${ANSI.red}-${ANSI.reset}`);
	}

	return `${indent}${file} | ${countColored} ${graphColored}`;
}

function getColoredSummaryLine(raw) {
	let updated = raw;
	updated = updated.replace(/(\d+)(\s+files?\ changed)/gi, `${ANSI.yellow}$1${ANSI.reset}$2`);
	updated = updated.replace(/(\d+)(\s+insertions?\(\+\))/gi, `${ANSI.green}$1${ANSI.reset}$2`);
	updated = updated.replace(/(\d+)(\s+deletions?\(-\))/gi, `${ANSI.red}$1${ANSI.reset}$2`);
	return updated === raw ? undefined : updated;
}

function colorizeGitMergeOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const diffStatLine = getColoredDiffStatLine(raw);
		if (diffStatLine) {
			line.editText(0, raw.length, diffStatLine);
			continue;
		}

		const summaryLine = getColoredSummaryLine(raw);
		if (summaryLine) {
			line.editText(0, raw.length, summaryLine);
			continue;
		}

		// e.g. Updating abc123..def456
		const updatingMatch = trimmed.match(/^Updating\s+([0-9a-f]{2,})\.\.([0-9a-f]{2,})\s*$/i);
		if (updatingMatch) {
			const indentLen = raw.length - trimmed.length;
			const indent = raw.slice(0, indentLen);
			const [, from, to] = updatingMatch;
			const colored = `${indent}Updating ${ANSI.yellow}${from}${reset}..${ANSI.yellow}${to}${reset}`;
			line.editText(0, raw.length, colored);
			continue;
		}

		if (trimmed === 'Fast-forward') {
			line.editText(0, raw.length, `${ANSI.green}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('Merge made by')) {
			line.editText(0, raw.length, `${ANSI.green}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('Auto-merging ')) {
			line.editText(0, raw.length, `${ANSI.dim}${raw}${reset}`);
			continue;
		}

		if (trimmed.startsWith('Automatic merge failed;')) {
			line.editText(0, raw.length, `${ANSI.red}${raw}${reset}`);
			continue;
		}

		if (/^(create|delete) mode\s+\d+\s+/i.test(trimmed)) {
			const color = trimmed.startsWith('delete mode') ? ANSI.red : ANSI.green;
			line.editText(0, raw.length, `${color}${raw}${reset}`);
		}
	}
}

function colorizeGitLogOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const diffStatLine = getColoredDiffStatLine(raw);
		if (diffStatLine) {
			line.editText(0, raw.length, diffStatLine);
			continue;
		}

		const summaryLine = getColoredSummaryLine(raw);
		if (summaryLine) {
			line.editText(0, raw.length, summaryLine);
			continue;
		}

		const commitMatch = trimmed.match(/^commit\s+([0-9a-f]{7,})(.*)$/i);
		if (commitMatch) {
			const indentLen = raw.length - trimmed.length;
			const indent = raw.slice(0, indentLen);
			const [, hash, rest] = commitMatch;

			let restColored = rest;
			restColored = restColored.replace(/\([^)]*\)/, (s) => `${ANSI.cyan}${s}${reset}`);

			const colored = `${indent}${ANSI.dim}commit${reset} ${ANSI.yellow}${hash}${reset}${restColored}`;
			line.editText(0, raw.length, colored);
			continue;
		}

		if (/^Author:\s+/i.test(trimmed)) {
			line.editText(0, raw.length, `${ANSI.cyan}${raw}${reset}`);
			continue;
		}

		if (/^Date:\s+/i.test(trimmed)) {
			line.editText(0, raw.length, `${ANSI.dim}${raw}${reset}`);
			continue;
		}

		// Commit subject lines (indented by 4 spaces in default format)
		if (/^\s{4}\S/.test(raw)) {
			line.editText(0, raw.length, `${ANSI.bold}${raw}${reset}`);
		}
	}
}

function colorizeGitReflogOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^([0-9a-f]{7,})(.*)$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, hash, rest] = match;

		let restColored = rest;
		restColored = restColored.replace(/\([^)]*\)/, (s) => `${ANSI.cyan}${s}${reset}`);
		restColored = restColored.replace(/\bHEAD@\{\d+\}:/, (s) => `${ANSI.yellow}${s}${reset}`);

		line.editText(0, raw.length, `${indent}${ANSI.yellow}${hash}${reset}${restColored}`);
	}
}

function colorizeGitStashListOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^(stash@\{\d+\}:)(\s+On\s+)([^:]+)(:)(.*)$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, stashId, on, branch, colon, rest] = match;

		const colored = `${indent}${ANSI.yellow}${stashId}${reset}${on}${ANSI.cyan}${branch}${reset}${colon}${rest}`;
		line.editText(0, raw.length, colored);
	}
}

function colorizeGitRemoteVerboseOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^(\S+)(\s+)(\S+)(\s+)\((fetch|push)\)\s*$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, remote, ws1, url, ws2, kind] = match;

		const colored = `${indent}${ANSI.cyan}${remote}${reset}${ws1}${url}${ws2}${ANSI.dim}(${kind})${reset}`;
		line.editText(0, raw.length, colored);
	}
}

function colorizeGitCheckIgnoreVerboseOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^(\S*gitignore:\d+:[^\s]+)(\s+)(\S+)\s*$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, rule, ws, file] = match;

		const colored = `${indent}${ANSI.yellow}${rule}${reset}${ws}${ANSI.cyan}${file}${reset}`;
		line.editText(0, raw.length, colored);
	}
}

function colorizeGitBlameOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^([0-9a-f]{7,})(\s+\([^)]*\))(\s+.*)$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, hash, meta, rest] = match;

		const colored = `${indent}${ANSI.yellow}${hash}${reset}${ANSI.dim}${meta}${reset}${rest}`;
		line.editText(0, raw.length, colored);
	}
}

function colorizeGitBisectOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (trimmed.startsWith('Bisecting: ')) {
			line.editText(0, raw.length, `${ANSI.cyan}${raw}${reset}`);
			continue;
		}

		if (trimmed.includes('first bad commit')) {
			line.editText(0, raw.length, `${ANSI.red}${raw}${reset}`);
			continue;
		}

		const match = trimmed.match(/^\[([0-9a-f]{5,})\.{3}\](\s+)(.*)$/i);
		if (match) {
			const indentLen = raw.length - trimmed.length;
			const indent = raw.slice(0, indentLen);
			const [, hash, ws, rest] = match;
			line.editText(0, raw.length, `${indent}[${ANSI.yellow}${hash}${reset}...]${ws}${rest}`);
		}
	}

	// Bisect result output often includes a commit summary block
	if (looksLikeGitLogOutput(codeBlock.code)) {
		colorizeGitLogOutput(codeBlock);
	}
}

function colorizeGitCountObjectsOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = raw.match(/^(\s*)([a-z-]+:)(\s+)(\S+)(.*)$/i);
		if (!match) continue;

		const [, indent, key, ws, value, rest] = match;
		line.editText(0, raw.length, `${indent}${ANSI.cyan}${key}${reset}${ws}${ANSI.yellow}${value}${reset}${rest}`);
	}
}

function colorizeGitVersionOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		const match = trimmed.match(/^git version\s+(\d+(?:\.\d+)*)(.*)$/i);
		if (!match) continue;

		const indentLen = raw.length - trimmed.length;
		const indent = raw.slice(0, indentLen);
		const [, version, rest] = match;
		line.editText(0, raw.length, `${indent}${ANSI.dim}git version${reset} ${ANSI.yellow}${version}${reset}${rest}`);
	}
}

function colorizeGitConfigUsageOutput(codeBlock) {
	const reset = ANSI.reset;

	for (const line of codeBlock.getLines()) {
		const raw = line.text;
		const trimmed = raw.trimStart();
		if (!trimmed || isPromptLine(trimmed)) continue;

		if (/^usage:\s+git\s+/i.test(trimmed)) {
			line.editText(0, raw.length, `${ANSI.dim}${raw}${reset}`);
			continue;
		}

		const optionMatch = raw.match(/^(\s*)(--?[a-zA-Z0-9][\w-]*)(\s+.*)$/);
		if (optionMatch) {
			const [, indent, option, rest] = optionMatch;
			line.editText(0, raw.length, `${indent}${ANSI.cyan}${option}${reset}${rest}`);
			continue;
		}

		if (/^\S.*$/.test(trimmed) && !trimmed.includes(':') && !trimmed.startsWith('...')) {
			// Section headers like "Config file location"
			line.editText(0, raw.length, `${ANSI.bold}${raw}${reset}`);
		}
	}
}

function gitTourGitBashOutputPlugin() {
	return {
		name: 'GitTourGitBashOutput',
		hooks: {
			preprocessLanguage({ codeBlock }) {
				const lang = codeBlock.language;

				// Use ```git for Git Bash-like outputs.
				if (GIT_OUTPUT_LANG_ALIASES.has(lang)) {
					codeBlock.language = 'ansi';
					return;
				}

				// Conservative auto-detection for plain text outputs.
				if (!MAYBE_GIT_OUTPUT_LANGS.has(lang)) return;

				const code = codeBlock.code;
				if (
					looksLikeGitStatusLongOutput(code) ||
					looksLikeGitStatusShortOutput(code) ||
					looksLikeGitDiffOutput(code) ||
					looksLikeGitMergeOutput(code) ||
					looksLikeGitBisectOutput(code) ||
					looksLikeGitLogOutput(code) ||
					looksLikeGitReflogOutput(code) ||
					looksLikeGitBranchOutput(code) ||
					looksLikeGitStashListOutput(code) ||
					looksLikeGitRemoteVerboseOutput(code) ||
					looksLikeGitCheckIgnoreVerboseOutput(code) ||
					looksLikeGitBlameOutput(code) ||
					looksLikeGitCountObjectsOutput(code) ||
					looksLikeGitVersionOutput(code) ||
					looksLikeGitConfigUsageOutput(code) ||
					looksLikeGitTransportErrorOutput(code)
				) {
					codeBlock.language = 'ansi';
				}
			},
			preprocessCode({ codeBlock }) {
				if (codeBlock.language !== 'ansi') return;

				// 1) Make \u001b / \x1b / \e / \033 author-friendly in Markdown
				for (const line of codeBlock.getLines()) {
					const replaced = replaceVisibleAnsiEscapes(line.text);
					if (replaced !== line.text) {
						line.editText(0, line.text.length, replaced);
					}
				}

				// If the block already contains real ANSI escapes, don't auto-inject.
				if (codeBlock.code.includes(ESC)) return;

				const code = codeBlock.code;

				if (looksLikeGitDiffOutput(code)) {
					colorizeGitDiffOutput(codeBlock);
					return;
				}

				if (looksLikeGitStatusLongOutput(code) || looksLikeGitStatusShortOutput(code)) {
					colorizeGitStatusOutput(codeBlock);
					return;
				}

				if (looksLikeGitMergeOutput(code)) {
					colorizeGitMergeOutput(codeBlock);
					if (looksLikeGitTransportErrorOutput(code)) {
						colorizeGitTransportErrorOutput(codeBlock);
					}
					return;
				}

				if (looksLikeGitBisectOutput(code)) {
					colorizeGitBisectOutput(codeBlock);
					if (looksLikeGitTransportErrorOutput(code)) {
						colorizeGitTransportErrorOutput(codeBlock);
					}
					return;
				}

				if (looksLikeGitLogOutput(code)) {
					colorizeGitLogOutput(codeBlock);
					return;
				}

				if (looksLikeGitReflogOutput(code)) {
					colorizeGitReflogOutput(codeBlock);
					return;
				}

				if (looksLikeGitBranchOutput(code)) {
					colorizeGitBranchOutput(codeBlock);
					return;
				}

				if (looksLikeGitStashListOutput(code)) {
					colorizeGitStashListOutput(codeBlock);
					return;
				}

				if (looksLikeGitRemoteVerboseOutput(code)) {
					colorizeGitRemoteVerboseOutput(codeBlock);
					return;
				}

				if (looksLikeGitCheckIgnoreVerboseOutput(code)) {
					colorizeGitCheckIgnoreVerboseOutput(codeBlock);
					return;
				}

				if (looksLikeGitBlameOutput(code)) {
					colorizeGitBlameOutput(codeBlock);
					return;
				}

				if (looksLikeGitCountObjectsOutput(code)) {
					colorizeGitCountObjectsOutput(codeBlock);
					return;
				}

				if (looksLikeGitVersionOutput(code)) {
					colorizeGitVersionOutput(codeBlock);
					return;
				}

				if (looksLikeGitConfigUsageOutput(code)) {
					colorizeGitConfigUsageOutput(codeBlock);
					return;
				}

				if (looksLikeGitTransportErrorOutput(code)) {
					colorizeGitTransportErrorOutput(codeBlock);
				}
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://gittour.pages.dev',
	integrations: [
		starlight({
			title: 'GitTour',
			description: '全网最全面的中文 Git 教程，从入门到专家一路打通。',
			logo: { src: './src/assets/gittour-logo.svg', alt: 'GitTour' },
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/VrianCao/GitTour' }],
			editLink: { baseUrl: 'https://github.com/VrianCao/GitTour/edit/master/' },
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			expressiveCode: {
				plugins: [gitTourGitBashOutputPlugin()],
				customizeTheme: (theme) => {
					Object.assign(theme.colors, GIT_BASH_ANSI_PALETTE);
					return theme;
				},
				shiki: {
					langAlias: {
						gitignore: 'shellscript',
					},
				},
			},
			components: { Head: './src/components/Head.astro' },
			sidebar: [
				{ label: '首页', link: '/' },
				{
					label: '01. 入门篇：Git 初相见',
					autogenerate: { directory: '01-getting-started' },
				},
				{
					label: '02. 基础篇：核心操作',
					autogenerate: { directory: '02-basics' },
				},
				{
					label: '03. 进阶篇：分支与合并',
					autogenerate: { directory: '03-branching' },
				},
				{
					label: '04. 协作篇：远程与团队',
					autogenerate: { directory: '04-collaboration' },
				},
				{
					label: '05. 高级篇：重写历史与调试',
					autogenerate: { directory: '05-advanced' },
				},
				{
					label: '06. 原理篇：Git 内部机制',
					autogenerate: { directory: '06-internals' },
				},
				{
					label: '07. 实战篇：工作流与策略',
					autogenerate: { directory: '07-workflows' },
				},
				{
					label: '08. 工具篇：效率与扩展',
					autogenerate: { directory: '08-tools' },
				},
				{
					label: '09. 专家篇：故障排除与维护',
					autogenerate: { directory: '09-maintenance' },
				},
			],
		}),
	],
});
