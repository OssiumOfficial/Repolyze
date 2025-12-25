"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent flash by not rendering children until mounted
    // The CSS background on html/body will show correct theme colors
    if (!mounted) {
        return (
            <NextThemesProvider {...props}>
                <div style={{ visibility: "hidden" }}>{children}</div>
            </NextThemesProvider>
        )
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}