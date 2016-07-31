'use babel';

import { CompositeDisposable } from 'atom'
import { get } from 'lodash'
import relative from 'relative'

const extractPath = (element) => {
  const path = element.dataset.path ? element.dataset.path : element.children[0].dataset.path

  if (!path) {
    atom.notifications.addError(`
      tree-view-copy-relative-path:
      unable to extract path from node.`)
    console.error("Unable to extract path from node: ", element)
  }

  return path
}
const formatPath = (path) => {
  if (atom.config.get('tree-view-copy-relative-path.replaceBackslashes')) {
    path = path.replace(/\\/g, "/")
  }
  return path
}
const stringifyPath = (path, delimiters) => `${delimiters}${path}${delimiters}`

module.exports = TreeViewCopyRelativePath = {
  SELECTOR: '.tree-view .file',
  COMMAND: 'tree-view-copy-relative-path:copy-path',
  subscriptions: null,
  config: {
    replaceBackslashes: {
      title: 'Replace backslashes (\\) with forward slashes (/) (usefull for Windows)',
      type: 'boolean',
      default: true,
    },
    stringDelimiters: {
      title: 'String delimiters',
      type: 'string',
      default: `'`,
    },
  },
  activate(state) {
    command = atom.commands.add(
      this.SELECTOR,
      this.COMMAND,
      ({target}) => this.copyRelativePath(extractPath(target))
    )

    this.subscriptions = new CompositeDisposable
    this.subscriptions.add(command)
  },
  deactivate() {
    this.subscriptions.dispose()
  },
  copyRelativePath(treeViewPath) {
    if (!treeViewPath) return
    const STRING_DELIMITERS = atom.config.get('tree-view-copy-relative-path.stringDelimiters')

    currentPath = get(atom.workspace.getActivePaneItem(), 'buffer.file.path')
    if (!currentPath) {
      atom.notifications.addWarning(`
        "Copy Relative Path" command
        has no effect when no files are open`)
      return
    }

    const relativePath = relative(currentPath, treeViewPath)
    const formattedPath = formatPath(relativePath)
    const stringifiedPath = stringifyPath(formattedPath, STRING_DELIMITERS)

    const importLine = `import from ${stringifiedPath}`

    atom.clipboard.write(importLine)
  },
}
