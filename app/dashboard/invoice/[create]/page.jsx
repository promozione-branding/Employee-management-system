import React from 'react'
import CreateInvoice from './CreateInvoice'

const page = async({params}) => {
  const {create}= await params;
  return (
    <CreateInvoice id={create}/>
  )
}

export default page