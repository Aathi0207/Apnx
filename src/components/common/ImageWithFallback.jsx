import { useState } from 'react'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'

const ImageWithFallback = ({ src, alt, className = '', style = {}, ...rest }) => {
  const [errored, setErrored] = useState(false)

  return (
    <img
      src={errored || !src ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
      loading="lazy"
      {...rest}
    />
  )
}

export default ImageWithFallback
