import { Log } from '@renderer/types/log'
import cn from '@renderer/utils/classnames'
import { format, isAfter, subSeconds } from 'date-fns'
import React, { Fragment, useMemo } from 'react'
import { isObjectLike } from '../utils/is-object-like'
import ObjectTree from './ObjectTree'

type LogProps = {
  onOpenContextMenu: () => void
  isShowingContextMenu: boolean
  log: Log
}

const LogItem: React.FC<LogProps> = ({ log, onOpenContextMenu, isShowingContextMenu }) => {
  function parseLogContent(content: string) {
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
      try {
        return JSON.parse(content)
      } catch {
        return content
      }
    }
    return content
  }

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault()
        onOpenContextMenu()
      }}
      tabIndex={0}
      onMouseDown={(e) => {
        if (e.nativeEvent.button === 2) {
          e.nativeEvent.preventDefault()
        }
      }}
      className={cn(
        'grid grid-cols-10 px-4 focus:outline-none border-b border-border-light bg-background focus:bg-primary/5',
        isAfter(new Date(log.createdAt), subSeconds(new Date(), 1)) && 'fade-in',
        isShowingContextMenu && 'bg-background-lighter'
      )}
    >
      {/* Date */}
      <div className="p-2 col-span-1">
        <p className="text-foreground-muted truncate">
          {log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss:SSS') : 'No date'}
        </p>
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col overflow-x-auto col-span-6 gap-1">
        {log.content?.map((item) => {
          const parsedItemContent = parseLogContent(item.content)

          return (
            <Fragment key={item.id}>
              {isObjectLike(parsedItemContent) || Array.isArray(parsedItemContent) ? (
                <div className="json-viewer font-mono">
                  <ObjectTree depth={1} json={parsedItemContent} />
                </div>
              ) : (
                <p className="truncate">{String(parsedItemContent)}</p>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Project Name */}
      <div className="p-2 flex">
        <p className="text-foreground-muted truncate">{log.project?.name}</p>
      </div>

      {/* Location */}
      <div className="p-2">
        <p className="text-foreground-muted truncate"></p>
      </div>
    </div>
  )
}

export default LogItem
