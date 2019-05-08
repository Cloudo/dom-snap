import { Options, Props, Flags, Comments } from './types'

const element = (options: Options) => {
  const render = (node: HTMLElement) => {
    const props: Props = Object.keys(options.props).reduce(
      (acc, propKey) => ({ ...acc, [propKey]: options.props[propKey](node) }),
      {}
    )

    const { label, value } = props

    let flags = [] as Flags
    if (options.flags && typeof options.flags === 'function') {
      const flagsValues = options.flags(props)
      flags = Object.keys(flagsValues).map(char =>
        flagsValues[char] ? char : ' '
      )
    }

    let comments = [] as Comments
    if (options.comments && typeof options.comments === 'function') {
      comments = options.comments(props).filter(c => c)
    }

    return [
      `[${flags.join('')}]`,
      label,
      options.props.value ? `${value}` : null,
      comments.length ? `[${comments.join('|')}]` : null,
    ]
      .filter(s => s)
      .join(' ')
  }

  return {
    render,
    ...options,
  }
}

export default element
