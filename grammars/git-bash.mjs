const gitBash = {
  displayName: 'Git Bash Output',
  name: 'git-bash',
  aliases: ['git', 'git-output', 'gitbash'],
  scopeName: 'source.git-bash',
  patterns: [
    { include: '#prompt' },
    { include: '#errors' },
    { include: '#merge' },
    { include: '#diff' },
    { include: '#status' },
    { include: '#shortStatus' },
    { include: '#branch' },
    { include: '#stash' },
    { include: '#remote' },
    { include: '#log' },
    { include: '#blame' },
    { include: '#bisect' },
    { include: '#usage' },
    { include: '#tree' }
  ],
  repository: {
    prompt: {
      patterns: [
        { name: 'gitbash.prompt', match: '^(\\$|>)\\s+' }
      ]
    },
    errors: {
      patterns: [
        { name: 'gitbash.error.fatal', match: '^fatal:.*$' },
        { name: 'gitbash.error', match: '^error:.*$' },
        { name: 'gitbash.warning', match: '^warning:.*$' },
        { name: 'gitbash.hint', match: '^hint:.*$' },
        { name: 'gitbash.remote', match: '^remote:.*$' },
        { name: 'gitbash.error', match: '^\\s*!\\s+\\[rejected\\].*$' }
      ]
    },
    merge: {
      patterns: [
        { name: 'gitbash.merge.action', match: '^Auto-merging.*$' },
        { name: 'gitbash.merge.conflict', match: '^CONFLICT.*$' },
        { name: 'gitbash.merge.conflict', match: '^Automatic merge failed.*$' },
        { name: 'gitbash.merge.success', match: '^Merge made by.*$' },
        { name: 'gitbash.merge.success', match: '^Fast-forward$' },
        { name: 'gitbash.merge.info', match: '^Updating\\s+[0-9a-f]+\\.\\.[0-9a-f]+$' },
        { name: 'gitbash.merge.info', match: '^create mode\\s+\\d+\\s+.*$' }
      ]
    },
    diff: {
      patterns: [
        { name: 'gitbash.diff.meta', match: '^diff --git .*' },
        { name: 'gitbash.diff.meta', match: '^index .*' },
        { name: 'gitbash.diff.file.removed', match: '^--- .*' },
        { name: 'gitbash.diff.file.added', match: '^\\+\\+\\+ .*' },
        { name: 'gitbash.diff.hunk', match: '^@@ .* @@.*$' },
        { name: 'gitbash.diff.removed', match: '^-(?!--).*' },
        { name: 'gitbash.diff.added', match: '^\\+(?!\\+\\+).*' }
      ]
    },
    status: {
      patterns: [
        { include: '#statusStaged' },
        { include: '#statusUnstaged' },
        { include: '#statusUnmerged' },
        { include: '#statusUntracked' },
        {
          match: '^On branch (.+)$',
          captures: {
            1: { name: 'gitbash.branch.name' }
          }
        },
        {
          name: 'gitbash.status.info',
          match: '^HEAD detached at (.+)$',
          captures: {
            1: { name: 'gitbash.commit.hash' }
          }
        },
        {
          name: 'gitbash.status.info',
          match: '^HEAD detached from (.+)$',
          captures: {
            1: { name: 'gitbash.commit.hash' }
          }
        },
        { name: 'gitbash.status.info', match: '^Your branch is.*$' },
        { name: 'gitbash.status.info', match: '^no changes added to commit.*$' },
        { name: 'gitbash.status.info', match: '^You have unmerged paths\\.$' },
        { name: 'gitbash.status.clean', match: '^nothing to commit, working tree clean$' },
        { name: 'gitbash.status.untracked', match: '^nothing added to commit but untracked files present.*$' }
      ]
    },
    statusStaged: {
      begin: '^Changes to be committed:$',
      beginCaptures: {
        0: { name: 'gitbash.status.header.staged' }
      },
      end: '^(?=Changes not staged for commit:|Unmerged paths:|Untracked files:|$)',
      patterns: [
        { name: 'gitbash.hint', match: '^\\s+\\(use ".*".*\\)$' },
        {
          match: '^\\s+(new file|modified|deleted|renamed)(:)(\\s+)(.+)$',
          captures: {
            1: { name: 'gitbash.status.staged' },
            2: { name: 'gitbash.status.staged' },
            4: { name: 'gitbash.path.staged' }
          }
        }
      ]
    },
    statusUnstaged: {
      begin: '^Changes not staged for commit:$',
      beginCaptures: {
        0: { name: 'gitbash.status.header.unstaged' }
      },
      end: '^(?=Changes to be committed:|Unmerged paths:|Untracked files:|$)',
      patterns: [
        { name: 'gitbash.hint', match: '^\\s+\\(use ".*".*\\)$' },
        {
          match: '^\\s+(modified|deleted|renamed)(:)(\\s+)(.+)$',
          captures: {
            1: { name: 'gitbash.status.unstaged' },
            2: { name: 'gitbash.status.unstaged' },
            4: { name: 'gitbash.path.unstaged' }
          }
        }
      ]
    },
    statusUnmerged: {
      begin: '^Unmerged paths:$',
      beginCaptures: {
        0: { name: 'gitbash.status.header.unmerged' }
      },
      end: '^(?=Changes to be committed:|Changes not staged for commit:|Untracked files:|$)',
      patterns: [
        { name: 'gitbash.hint', match: '^\\s+\\(use ".*".*\\)$' },
        {
          match: '^\\s+(both modified|both deleted|added by us|added by them|both added|deleted by us|deleted by them)(:)(\\s+)(.+)$',
          captures: {
            1: { name: 'gitbash.status.unmerged' },
            2: { name: 'gitbash.status.unmerged' },
            4: { name: 'gitbash.path.unmerged' }
          }
        }
      ]
    },
    statusUntracked: {
      begin: '^Untracked files:$',
      beginCaptures: {
        0: { name: 'gitbash.status.header.untracked' }
      },
      end: '^(?=Changes to be committed:|Changes not staged for commit:|Unmerged paths:|$)',
      patterns: [
        { name: 'gitbash.hint', match: '^\\s+\\(use ".*".*\\)$' },
        {
          match: '^\\s{4,}(.+)$',
          captures: {
            1: { name: 'gitbash.path.untracked' }
          }
        }
      ]
    },
    shortStatus: {
      patterns: [
        {
          match: '^(\\?\\?)\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.short-status.untracked' },
            2: { name: 'gitbash.path' }
          }
        },
        {
          match: '^([ MADRCU?!])([ MADRCU?!])\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.short-status.index' },
            2: { name: 'gitbash.short-status.worktree' },
            3: { name: 'gitbash.path' }
          }
        }
      ]
    },
    branch: {
      patterns: [
        {
          match: '^\\*\\s+([\\w./-]+)(?:\\s+([0-9a-f]{7,})\\s+(.*))?$',
          captures: {
            1: { name: 'gitbash.branch.current' },
            2: { name: 'gitbash.branch.commit' },
            3: { name: 'gitbash.branch.message' }
          }
        },
        {
          match: '^\\s+([\\w./-]+)(?:\\s+([0-9a-f]{7,})\\s+(.*))?$',
          captures: {
            1: { name: 'gitbash.branch.name' },
            2: { name: 'gitbash.branch.commit' },
            3: { name: 'gitbash.branch.message' }
          }
        }
      ]
    },
    stash: {
      patterns: [
        {
          match: '^(stash@\\{\\d+\\})(:)(\\s+)(.*)$',
          captures: {
            1: { name: 'gitbash.stash.id' },
            2: { name: 'gitbash.punctuation' },
            4: { name: 'gitbash.stash.message' }
          }
        }
      ]
    },
    remote: {
      patterns: [
        {
          match: '^(\\S+)\\s+(\\S+)\\s+\\((fetch|push)\\)$',
          captures: {
            1: { name: 'gitbash.remote.name' },
            2: { name: 'gitbash.remote.url' },
            3: { name: 'gitbash.remote.direction' }
          }
        }
      ]
    },
    log: {
      patterns: [
        {
          name: 'gitbash.commit.keyword',
          match: '^commit\\s+([0-9a-f]{7,})$',
          captures: {
            1: { name: 'gitbash.commit.hash' }
          }
        },
        {
          name: 'gitbash.meta.key',
          match: '^Author:\\s+(.+)$',
          captures: {
            1: { name: 'gitbash.meta.value' }
          }
        },
        {
          name: 'gitbash.meta.key',
          match: '^Date:\\s+(.+)$',
          captures: {
            1: { name: 'gitbash.meta.value' }
          }
        },
        {
          match: '^[*|\\\\/\\s]+([0-9a-f]{7,})\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.commit.hash' },
            2: { name: 'gitbash.commit.message' }
          }
        },
        {
          match: '^([0-9a-f]{7,})\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.commit.hash' },
            2: { name: 'gitbash.commit.message' }
          }
        },
        {
          match: '^\\s+\\S+\\s+\\|\\s+\\d+\\s+(\\+{1,})?(-{1,})?$',
          captures: {
            1: { name: 'gitbash.diffstat.added' },
            2: { name: 'gitbash.diffstat.removed' }
          }
        },
        {
          name: 'gitbash.stats',
          match: '^\\s+\\S+\\s+\\|\\s+\\d+.*$'
        },
        {
          name: 'gitbash.stats',
          match: '^\\s+\\d+\\s+files? changed.*$'
        }
      ]
    },
    blame: {
      patterns: [
        {
          match: '^([0-9a-f]{7,})\\s+\\(([^)]+)\\)\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.blame.hash' },
            2: { name: 'gitbash.blame.meta' },
            3: { name: 'gitbash.blame.code' }
          }
        }
      ]
    },
    bisect: {
      patterns: [
        { name: 'gitbash.info', match: '^Bisecting:.*$' },
        {
          match: '^\\[([0-9a-f.]{4,})\\]\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.commit.hash' },
            2: { name: 'gitbash.commit.message' }
          }
        },
        {
          name: 'gitbash.error',
          match: '^([0-9a-f]{4,}\\.\\.\\.) is the first bad commit$'
        }
      ]
    },
    usage: {
      patterns: [
        { name: 'gitbash.usage', match: '^usage:.*$' }
      ]
    },
    tree: {
      patterns: [
        {
          match: '^(\\d{6})\\s+(blob|tree|commit|tag)\\s+([0-9a-f]{7,})\\s+(.*)$',
          captures: {
            1: { name: 'gitbash.object.mode' },
            2: { name: 'gitbash.object.type' },
            3: { name: 'gitbash.commit.hash' },
            4: { name: 'gitbash.path' }
          }
        }
      ]
    }
  }
};

export default gitBash;
