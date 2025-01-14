import React from 'react'

type PlusProps = {
  className?: string
}

const Plus: React.FC<PlusProps> = ({ className }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 16.4746 16.123"
      className={className}
    >
      <g>
        <rect height="16.123" opacity="0" width="16.4746" x="0" y="0" />
        <path
          d="M0 8.05664C0 8.53516 0.400391 8.92578 0.869141 8.92578L7.1875 8.92578L7.1875 15.2441C7.1875 15.7129 7.57812 16.1133 8.05664 16.1133C8.53516 16.1133 8.93555 15.7129 8.93555 15.2441L8.93555 8.92578L15.2441 8.92578C15.7129 8.92578 16.1133 8.53516 16.1133 8.05664C16.1133 7.57812 15.7129 7.17773 15.2441 7.17773L8.93555 7.17773L8.93555 0.869141C8.93555 0.400391 8.53516 0 8.05664 0C7.57812 0 7.1875 0.400391 7.1875 0.869141L7.1875 7.17773L0.869141 7.17773C0.400391 7.17773 0 7.57812 0 8.05664Z"
          fillOpacity={0.85}
        />
      </g>
    </svg>
  )
}

export default Plus
