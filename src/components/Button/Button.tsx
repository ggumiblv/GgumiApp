import type { ButtonHTMLAttributes } from 'react'
import './Button.scss'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'dashed' | 'danger' | 'ghost'
  icon?: string
}

function Button({ variant = 'primary', icon, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={`button button--${variant}`} {...props}>
      {icon && <img src={icon} alt="" />}
      {children}
    </button>
  )
}

export default Button
