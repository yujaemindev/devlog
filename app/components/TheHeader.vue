<template>
  <nav
    ref="headerElement"
    class="site-header md:max-w-6xl mx-auto sticky top-0 z-50"
    :class="{ 'is-compact': isCompact }"
  >
    <div
      class="bg-white flex flex-wrap items-center justify-center md:py-2 py-1 border-b border-gray-200 text-2xl sm:px-2 md:px-1"
    >
      <ul class="header-links flex flex-wrap items-center justify-center list-reset m-0 w-full md:w-auto">
        <li
          v-for="item in navLinks"
          :key="item.path"
        >
          <details
            v-if="item.children"
            class="relative open:z-50"
            @toggle="onMenuToggle"
            @pointerenter="setMenuHover($event, true)"
            @pointerleave="setMenuHover($event, false)"
            @keydown.esc="closeMenu"
          >
            <summary
              class="header-link flex flex-col items-center justify-center gap-0.5 list-none cursor-pointer px-3 py-3 text-center font-bold text-lg md:px-4 md:text-2xl hover:text-indigo-600 [&::-webkit-details-marker]:hidden"
              :class="$route.path.startsWith(item.path) ? 'text-indigo-600' : 'text-gray-900'"
            >
              <span>{{ item.name }}</span>
              <span
                v-if="selectedSubmenu(item)"
                class="header-subtitle whitespace-nowrap text-[12px] font-normal leading-3 text-indigo-500"
              >
                {{ selectedSubmenu(item).name }}
              </span>
            </summary>
            <ul class="absolute right-0 top-full z-50 min-w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <li v-for="child in item.children" :key="child.path">
                <NuxtLink
                  :to="child.path"
                  class="block whitespace-nowrap rounded-lg px-4 py-2 text-base font-semibold hover:bg-indigo-50"
                  exact-active-class="bg-indigo-50 text-indigo-600"
                  @click="closeMenu"
                >
                  {{ child.name }}
                </NuxtLink>
              </li>
            </ul>
          </details>
          <NuxtLink
            v-else
            :to="item.path"
            exact-active-class="text-indigo-600"
            class="header-link flex items-center justify-center px-3 md:px-4 py-3 no-underline text-gray-900 hover:text-gray-700 font-bold text-lg md:text-2xl"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import menu from "../data/menu"

export default {
  name: "TheHeader",
  setup() {
    const headerElement = ref(null)
    const isCompact = ref(false)
    const headerHeight = useState('site-header-height', () => 89)
    let observer
    const updateCompact = () => {
      // Separate thresholds prevent header resizing from repeatedly toggling it.
      if (window.scrollY > 120) isCompact.value = true
      else if (window.scrollY < 24) isCompact.value = false
    }

    onMounted(() => {
      const updateHeight = () => {
        headerHeight.value = headerElement.value.getBoundingClientRect().height
        // Update sticky/fixed offsets before paint, without waiting for a Vue render.
        document.documentElement.style.setProperty('--site-header-height', `${headerHeight.value}px`)
      }
      updateHeight()
      observer = new ResizeObserver(updateHeight)
      observer.observe(headerElement.value)
      updateCompact()
      window.addEventListener('scroll', updateCompact, { passive: true })
    })
    onBeforeUnmount(() => {
      observer?.disconnect()
      window.removeEventListener('scroll', updateCompact)
      document.documentElement.style.removeProperty('--site-header-height')
    })

    return { headerElement, isCompact }
  },
  data(){
    return {
      navLinks: menu,
    }
  },
  methods: {
    onMenuToggle(event) {
      const openedMenu = event.currentTarget
      if (!openedMenu.open) return

      this.headerElement.querySelectorAll('details[open]').forEach((menu) => {
        if (menu !== openedMenu) menu.open = false
      })
    },
    setMenuHover(event, open) {
      // Touch-generated mouse events can otherwise toggle the menu before the tap.
      if (event.pointerType === 'mouse') event.currentTarget.open = open
    },
    selectedSubmenu(item) {
      const path = this.$route.path.replace(/\/$/, '')
      return item.children?.find(child => path === child.path || path.startsWith(`${child.path}/`))
    },
    closeMenu(event) {
      const details = event.target.closest('details')
      if (details) {
        details.open = false
        if (event.type === 'keydown') details.querySelector('summary').focus()
      }
    },
  },
}
</script>

<style scoped>
@media (width < 48rem) {
  .header-link {
    min-height: 44px;
    white-space: nowrap;
    transition: font-size 220ms ease, padding 220ms ease, gap 220ms ease;
  }

  .header-subtitle {
    max-height: 12px;
    max-width: min(36vw, 10rem);
    overflow: hidden;
    text-overflow: ellipsis;
    transition: max-height 220ms ease, max-width 220ms ease, opacity 160ms ease;
  }

  .is-compact .header-links {
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .is-compact .header-link {
    font-size: clamp(11px, 3.1vw, 14px);
    padding: 8px 4px;
    gap: 0;
  }

  .is-compact .header-subtitle {
    max-height: 0;
    max-width: 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-link,
  .header-subtitle {
    transition: none;
  }
}
</style>
