import { ref, watch } from 'vue'

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

    // Calculate max radius from the click point
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      isDark.value = nextDark
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        { clipPath: nextDark ? clipPath : [...clipPath].reverse() },
        {
          duration: 400,
          easing: 'ease-in-out',
          pseudoElement: nextDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      )
    })
  }

  return {
    isDark,
    toggleTheme,
  }
}
