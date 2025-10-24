import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useParams } from "@tanstack/react-router"
import { useData, useTheme, useOrgs, useSettings } from "/imports/api/providers"
import { Loading } from "/imports/ui/Components"
import { KioskLayout } from "/imports/ui/Layouts"
import Kiosk from "/imports/ui/Kiosk"

const VotingRoute = observer(() => {
  const { id } = useParams({ from: "/voting/$id/$member" })
  const data = useData()
  const { theme, isLoading: themeLoading } = useTheme()
  const { isLoading: orgsLoading } = useOrgs()
  const { isLoading: settingsLoading } = useSettings()

  const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

  useEffect(() => {
    data.themeId = id
  }, [id])

  useEffect(() => {
    const loadingTest = themeLoading || orgsLoading || settingsLoading
    if (loadingTest !== isLoading) {
      setIsLoading(loadingTest)
    }
  }, [themeLoading, orgsLoading, settingsLoading])

  if (isLoading) {
    return <Loading />
  }

  return (
    <KioskLayout>
      <Kiosk />
    </KioskLayout>
  )
})

export default VotingRoute
