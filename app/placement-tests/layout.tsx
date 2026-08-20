import DashboardFooter from '@/components/layout/dash-footer'
import DashboardNavbar from '@/components/layout/navbar'
import React from 'react'

function layout({children}:{children:React.ReactNode}) {
  return (
    <main>
        <DashboardNavbar/>
        {children}
        <DashboardFooter/>
        </main>
  )
}

export default layout