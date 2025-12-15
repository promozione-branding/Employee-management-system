import React from 'react'
import PdfDownload from './PdfDownload'

const page = async({params}) => {
  const {id} = await params
  return (
    <PdfDownload id={id}/>
  )
}

export default page