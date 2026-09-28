import { nextTick, ref, watch } from 'vue'

const STORAGE_KEY = 'hl-theme'

function getInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialDark())

// Apply on init
document.documentElement.classList.toggle('dark', isDark.value)

watch(isDark, (value) => {
  document.documentElement.classList.toggle('dark', value)
  document.documentElement.style.colorScheme = value ? 'dark' : 'light'
  localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light')
})

export function useTheme() {
  function toggleTheme(event?: MouseEvent) {
    const startDark = isDark.value
    const nextDark = !startDark

    // Use View Transition API if available for the ripple effect
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      isDark.value = nextDark
      return
    }

    // Capture click position for the ripple origin
    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    document.documentElement.style.setProperty('--theme-transition-x', `${x}px`)
    document.documentElement.style.setProperty('--theme-transition-y', `${y}px`)

    // Calculate max radius from the click point
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(async () => {
      isDark.value = nextDark
      await nextTick()
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        { clipPath },
        {
          duration: 400,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return {
    isDark,
    toggleTheme,
  }
}
