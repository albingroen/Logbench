import React from 'react'

type EllipsisCircleProps = {
  className?: string
}

const EllipsisCircle: React.FC<EllipsisCircleProps> = ({ className }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 20.2832 19.9316"
      className={className}
    >
      <g>
        <rect height="19.9316" opacity="0" width="20.2832" x="0" y="0" />
        <path
          d="M9.96094 19.9219C15.459 19.9219 19.9219 15.459 19.9219 9.96094C19.9219 4.46289 15.459 0 9.96094 0C4.46289 0 0 4.46289 0 9.96094C0 15.459 4.46289 19.9219 9.96094 19.9219ZM9.96094 18.2617C5.37109 18.2617 1.66016 14.5508 1.66016 9.96094C1.66016 5.37109 5.37109 1.66016 9.96094 1.66016C14.5508 1.66016 18.2617 5.37109 18.2617 9.96094C18.2617 14.5508 14.5508 18.2617 9.96094 18.2617Z"
          fillOpacity={0.85}
        />
        <path
          d="M14.5117 11.3672C15.2832 11.3672 15.9277 10.7324 15.9277 9.95117C15.9277 9.16992 15.2832 8.53516 14.5117 8.53516C13.7305 8.53516 13.0957 9.16992 13.0957 9.95117C13.0957 10.7324 13.7305 11.3672 14.5117 11.3672Z"
          fillOpacity={0.85}
        />
        <path
          d="M9.95117 11.3672C10.7324 11.3672 11.3672 10.7324 11.3672 9.95117C11.3672 9.16992 10.7324 8.53516 9.95117 8.53516C9.16992 8.53516 8.53516 9.16992 8.53516 9.95117C8.53516 10.7324 9.16992 11.3672 9.95117 11.3672Z"
          fillOpacity={0.85}
        />
        <path
          d="M5.40039 11.3672C6.17188 11.3672 6.80664 10.7324 6.80664 9.95117C6.80664 9.16992 6.16211 8.53516 5.40039 8.53516C4.61914 8.53516 3.98438 9.16992 3.98438 9.95117C3.98438 10.7324 4.61914 11.3672 5.40039 11.3672Z"
          fillOpacity={0.85}
        />
      </g>
    </svg>
  )
}

export default EllipsisCircle
