import snapshotDiff from 'snapshot-diff'

import { Component, _Document, SnapshotOptions, Line, PageSnap } from './types'

let defaultComponents = [] as Component[]
let _document = document as _Document

const prettySnap = (snap: string) => `
${snap.trim()}
`

export const setDocument = (nextDocument: _Document) => {
  _document = nextDocument
}

export const getDocument = () => {
  return typeof _document === 'function' ? _document() : _document
}

export const setDefaultComponents = (components: Component[]) => {
  defaultComponents = components
}

const printLines = (lines: string[]) =>
  lines.reduce(
    (res, line) => `${res}
${line}`,
    ''
  ).concat(`
`)

export const getPageSnapshot = (options: SnapshotOptions): PageSnap => {
  const {
    components = [],
    from = () => document.body,
    showUrl = false,
    exclude = { topbar: true },
    showFrom,
    showTo,
  } = options

  const finalComponents = [...defaultComponents, ...components]

  let lines = [] as Line[]
  if (showUrl) {
    lines = [
      ...[`> ${window.location.pathname + window.location.search}`, ''],
      ...lines,
    ]
  }

  const _from =
    typeof from === 'string' ? () => document.querySelector(from) : from
  const root = _from() || document.body
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: () => NodeFilter.FILTER_ACCEPT,
    },
    false
  )

  let prevGroup = ''
  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode as Element

    finalComponents
      .filter(component => !exclude[component.name])
      .forEach(el => {
        if (node.matches(el.selector)) {
          if (prevGroup && prevGroup !== el.group) {
            lines.push('')
          }
          prevGroup = el.group

          const renderResult = el.render(node)
          lines.push(renderResult)
        }
      })
  }

  let screen = printLines(lines)
  let fromIndex = showFrom || 0
  if (typeof showFrom === 'string') fromIndex = screen.indexOf(showFrom)
  let toIndex = screen.length
  if (typeof showTo === 'string') toIndex = screen.indexOf(showTo)

  return prettySnap(screen.substring(Number(fromIndex), Number(toIndex)))
}

export const snap = (name: string, options: SnapshotOptions) => {
  const pageSnap = getPageSnapshot(options)
  expect(pageSnap).toMatchSnapshot(name)
}

export const getSnap = (options: SnapshotOptions) => {
  let pageSnap = ''
  let prevName = ''

  const getPageSnap = (name: string, opt: SnapshotOptions) => {
    prevName = name
    pageSnap = getPageSnapshot({ ...options, ...opt })
    return pageSnap
  }

  const getDiffSnap = (diffName: string, opt = {}) => {
    const nextPageSnap = getPageSnapshot({ ...options, ...opt })
    const diffSnap = snapshotDiff(pageSnap, nextPageSnap, {
      contextLines: 0,
      aAnnotation: prevName,
      bAnnotation: diffName,
    })
    pageSnap = nextPageSnap
    return prettySnap(diffSnap.substr(diffSnap.indexOf('@@')))
  }

  const getAdditions = (diffName: string, opt: SnapshotOptions) => {
    const diffSnap = getDiffSnap(diffName, opt)
    const onlyChanges = diffSnap
      .split('\n')
      .filter(line => line[0] === '+')
      .map(line => line.substr(2))
    return printLines(onlyChanges)
  }

  const snap = (name: string, opt: SnapshotOptions) => {
    const pageSnap = getPageSnap(name, opt)
    expect(pageSnap).toMatchSnapshot(name)
  }

  const diff = (diffName: string, opt: SnapshotOptions) => {
    const diffSnap = getDiffSnap(diffName, opt)
    expect(diffSnap).toMatchSnapshot(diffName)
  }

  return {
    getPageSnap,
    getDiffSnap,
    getAdditions,
    snap,
    diff,
  }
}
