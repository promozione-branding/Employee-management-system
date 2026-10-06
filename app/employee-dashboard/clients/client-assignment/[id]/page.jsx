// app/employee-dashboard/clients/client-assignment/[id]/page.jsx

import React from 'react'
import ClientAssignment from './ClientAssignment'

const page = async({params}) => {
    const {id} = await params;
  return (
    <ClientAssignment customerId={id} />
  )
}

export default page