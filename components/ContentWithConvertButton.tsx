// components/ContentWithConvertButton.tsx
'use client'

import React from 'react'
import { Stack } from '@sanity/ui'
import { FormFieldProps } from 'sanity'
import { ConvertHtmlToBlocks } from './ConvertHtmlToBlocks'

export function ContentWithConvertButton(props: FormFieldProps) {
  const {renderDefault, onChange} = props

  return (
    <Stack space={3}>
      <ConvertHtmlToBlocks onChange={onChange} />
      {renderDefault(props)}
    </Stack>
  )
}
