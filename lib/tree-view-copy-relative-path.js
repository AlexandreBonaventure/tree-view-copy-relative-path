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

    currentPath = get(atom.workspace.getActivePaneItem(), 'buffer.file.path')
    if (!currentPath) {
      atom.notifications.addWarning(`
        "Copy Relative Path" command
        has no effect when no files are open`)
      return
    }

    relativePath = relative(currentPath, treeViewPath)
    if (atom.config.get('tree-view-copy-relative-path.replaceBackslashes')) {
      relativePath = relativePath.replace(/\\/g, "/")
    }

    atom.clipboard.write(relativePath)
  },
}
