import './SectionTitle.scss'

type SectionTitleProps = {
  title: string
  count: number
}

function SectionTitle({ title, count }: SectionTitleProps) {
  return (
    <h2 className="section-title">
      {title}
      {count > 0 && <span>{count}</span>}
    </h2>
  )
}

export default SectionTitle
