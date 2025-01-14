import React, { useState, useEffect } from 'react'
import classNames from '../utils/classnames'
import ObjectTree from './ObjectTree'

type JsonTreeProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any
  depth?: number
  _cur?: number
  _last?: boolean
  search?: string
}

const JsonTree: React.FC<JsonTreeProps> = ({
  json,
  depth = Infinity,
  _cur = 0,
  _last = true,
  search = ''
}) => {
  const [items, setItems] = useState<string[]>([])
  const [isArray, setIsArray] = useState(false)
  const [brackets, setBrackets] = useState(['', ''])
  const [collapsed, setCollapsed] = useState(false)

  // Utility functions
  const getType = (value: unknown): string => {
    if (value === null) return 'null'
    return typeof value
  }

  const stringify = (value: unknown): string => {
    return JSON.stringify(value)
  }

  const format = (value: unknown): string => {
    switch (getType(value)) {
      case 'function':
        return 'f () {...}'
      case 'symbol':
        return (value as string).toString()
      default:
        return stringify(value)
    }
  }

  const handleToggleCollapse = (): void => {
    setCollapsed((prev) => !prev)
  }

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (['Enter', ' '].includes(e.key)) {
      handleToggleCollapse()
    }
  }

  // Effects
  useEffect(() => {
    setItems(getType(json) === 'object' ? Object.keys(json) : [])
    const isArrayCheck = Array.isArray(json)
    setIsArray(isArrayCheck)
    setBrackets(isArrayCheck ? ['[', ']'] : ['{', '}'])
  }, [json])

  useEffect(() => {
    setCollapsed(depth < _cur)
  }, [depth, _cur])

  // Render
  if (!items.length) {
    return (
      <span className={`_jsonBkt ${isArray ? 'isArray' : ''}`}>
        {brackets[0]}
        {brackets[1]}
        {!_last && <span className="_jsonSep">,</span>}
      </span>
    )
  }

  if (collapsed) {
    return (
      <>
        <span
          className={`_jsonBkt ${isArray ? 'isArray' : ''}`}
          onClick={handleToggleCollapse}
          onKeyDown={handleKeyPress}
        >
          {brackets[0]}...{brackets[1]}
        </span>
        {!_last && <span className="_jsonSep">,</span>}
      </>
    )
  }

  return (
    <>
      <span
        className={`_jsonBkt ${isArray ? 'isArray' : ''}`}
        onClick={handleToggleCollapse}
        onKeyDown={handleKeyPress}
      >
        {brackets[0]}
      </span>
      <ul className="_jsonList">
        {items.map((item, idx) => (
          <li key={idx}>
            {!isArray && (
              <>
                <span className={classNames('_jsonKey', item === search && 'bg-yellow-500')}>
                  {stringify(item)}
                </span>
                <span className="_jsonSep">:&nbsp;</span>
              </>
            )}
            {getType(json[item]) === 'object' ? (
              <ObjectTree
                json={json[item]}
                depth={depth}
                _cur={_cur + 1}
                _last={idx === items.length - 1}
              />
            ) : (
              <>
                <span className={`_jsonVal ${getType(json[item])}`}>{format(json[item])}</span>
                {idx < items.length - 1 && <span className="_jsonSep">,</span>}
              </>
            )}
          </li>
        ))}
      </ul>
      <span
        className={`_jsonBkt ${isArray ? 'isArray' : ''}`}
        onClick={handleToggleCollapse}
        onKeyDown={handleKeyPress}
      >
        {brackets[1]}
      </span>
      {!_last && <span className="_jsonSep">,</span>}
    </>
  )
}

export default JsonTree
