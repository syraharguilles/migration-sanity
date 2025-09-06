// ./components/CustomStudioLayout.tsx
import React, { useState } from 'react'
import { StudioLayoutProps } from 'sanity'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { Button, Flex } from '@sanity/ui'
import { convertAllPosts } from '../components/convertAllPosts'
import { ConversionResultModal } from './ConversionResultModal'

type FailedItem = { _id: string; error: string }

type ConversionResult = {
  successCount: number
  failed: FailedItem[]
}

export function CustomStudioLayout({ renderDefault, ...props }: StudioLayoutProps) {
  const { state } = useRouter()
  const client = useClient({ apiVersion: '2023-01-01' })

  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState<ConversionResult>({ successCount: 0, failed: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const isPostListView = state?.panes?.length === 1 && state?.panes[0][0]?.id === 'post'

  const handleConvert = async () => {
    setIsLoading(true)
    setProgress({ current: 0, total: 0 })
    setModalOpen(true)

    try {
      const summary = await convertAllPosts(client, (current, total) => {
        setProgress({ current, total })
      })
      setResult(summary)
    } catch (err: any) {
      setResult({ successCount: 0, failed: [{ _id: 'global', error: err.message }] })
    } finally {
      setIsLoading(false)
    }
  }


  const handleDownloadLog = () => {
    if (!result.failed?.length) return
    const text = result.failed.map(item => `${item._id}: ${item.error}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'conversion-errors-log.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {isPostListView && (
        <Flex padding={3} justify="flex-end" style={{ borderBottom: '1px solid #ddd' }}>
          <Button
            text="Convert RAW HTML to Blocks"
            tone="positive"
            onClick={handleConvert}
          />
        </Flex>
      )}

      <ConversionResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownloadLog={handleDownloadLog}
        successCount={result?.successCount ?? 0}
        failed={Array.isArray(result?.failed) ? result.failed : []}
        isLoading={isLoading}
        progress={progress}
      />

      {renderDefault(props)}
    </>
  )
}
