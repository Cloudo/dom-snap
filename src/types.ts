export type Props = {
  label?: string
  value?: string
}
export type FlagsOptions = { [key: string]: string }
export type Flags = string[]
export type Comments = string[]
export type Line = string
export type PageSnap = Line

export type Options = {
  name: string
  group: string
  selector: string
  props: { [key: string]: (el: HTMLElement) => string }
  flags: (props: Props) => FlagsOptions
  comments: (props: Props) => Comments
}

export type Component = Options & {
  render: (node: Node) => string
}

export type NodeGetter = () => Node
export type _Document = Node | NodeGetter

export type SnapshotOptions = {
  components: Component[]
  from: string | NodeGetter
  showUrl: boolean
  exclude: { [componentName: string]: boolean }
  showFrom?: string | number
  showTo?: string | number
}
