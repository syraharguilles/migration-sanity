// ./components/ConversionResultModal.tsx
import React, { useEffect, useState } from 'react'
import { Dialog, Button, Box, Text, Card, Flex, Stack } from '@sanity/ui'

interface FailedItem {
  _id: string
  error: string
}

interface ProgressState {
  current: number
  total: number
}

interface Props {
  open: boolean
  onClose: () => void
  onDownloadLog?: () => void
  successCount: number
  failed: FailedItem[]
  isLoading: boolean
  progress: ProgressState
}

export function ConversionResultModal({
  open,
  onClose,
  onDownloadLog,
  successCount,
  failed,
  isLoading,
  progress
}: Props) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      setElapsedSeconds(0)
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [isLoading])

  if (!open) return null

  return (
    <Dialog
      id="conversion-dialog"
      header="RawHTML to Blocks Summary"
      width={1}
      onClose={onClose}
      open={open}
    >
      <Card padding={4}>
        {isLoading ? (
          <Stack space={4}>
            <Text size={2}>
              🔄 Converting {progress.current} of {progress.total} post(s)... ⏱️ {elapsedSeconds}s elapsed
            </Text>
            <Box style={{ background: '#eee', height: '8px', borderRadius: '4px' }}>
              <Box
                style={{
                  width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%',
                  height: '100%',
                  background: 'var(--card-fg-brand)',
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </Box>
          </Stack>
        ) : (
          <Stack space={4}>
            <Text size={2}>✅ {successCount} post(s) converted successfully.</Text>

            {failed.length > 0 && (
              <>
                <Box>
                  <Text size={2} style={{ color: 'var(--card-fg-danger)' }}>
                    ❌ {failed.length} post(s) failed:
                  </Text>
                </Box>
                <Box
                  padding={2}
                  style={{ maxHeight: 200, overflow: 'auto', backgroundColor: '#000' }}
                >
                  <pre style={{ fontSize: '0.85em' }}>
                    {failed.map(f => `${f._id}: ${f.error}`).join('\n')}
                  </pre>
                </Box>
                <Flex justify="space-between">
                  <Button text="Download Log" onClick={onDownloadLog} />
                  <Button text="Close" tone="primary" onClick={onClose} />
                </Flex>
              </>
            )}

            {failed.length === 0 && (
              <Flex justify="flex-end">
                <Button text="Close" tone="primary" onClick={onClose} />
              </Flex>
            )}
          </Stack>
        )}
      </Card>
    </Dialog>
  )
}
