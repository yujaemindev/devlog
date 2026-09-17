<template>
  <nav ref="headerElement" class="md:max-w-6xl mx-auto sticky top-0 z-50">
    <div
      class="bg-white flex flex-wrap items-center justify-center md:py-4 py-2 border-b border-gray-200 text-2xl sm:px-4 md:px-2"
    >
      <input
        id="menu-btn"
        class="menu-btn hidden"
        type="checkbox"
      >
      <label
        class="menu-icon block cursor-pointer md:hidden px-2 relative select-none"
        for="menu-btn"
      >
        <span class="bg-gray-900 flex items-center relative" />
      </label>

      <ul class="flex flex-wrap items-center justify-center list-reset m-0 w-full md:w-auto">
        <li
          v-for="item in navLinks"
          :key="item.path"
        >
          <details
            v-if="item.children"
            class="relative"
            @mouseenter="$event.currentTarget.open = true"
            @mouseleave="$event.currentTarget.open = false"
            @keydown.esc="closeMenu"
          >
            <summary
              class="list-none cursor-pointer px-3 py-3 font-bold text-lg md:px-4 md:text-2xl hover:text-indigo-600 [&::-webkit-details-marker]:hidden"
              :class="$route.path.startsWith(item.path) ? 'text-indigo-600' : 'text-gray-900'"
            >
              {{ item.name }}
            </summary>
            <ul class="absolute right-0 top-full min-w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <li v-for="child in item.children" :key="child.path">
                <NuxtLink
                  :to="child.path"
                  class="block rounded-lg px-4 py-2 text-base font-semibold hover:bg-indigo-50"
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
            class="block md:inline-block px-3 md:px-4 py-3 no-underline text-gray-900 hover:text-gray-700 font-bold text-lg md:text-2xl"
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
    const headerHeight = useState('site-header-height', () => 89)
    let observer

    onMounted(() => {
      const updateHeight = () => {
        headerHeight.value = headerElement.value.getBoundingClientRect().height
      }
      updateHeight()
      observer = new ResizeObserver(updateHeight)
      observer.observe(headerElement.value)
    })
    onBeforeUnmount(() => observer?.disconnect())

    return { headerElement }
  },
  data(){
    return {
      navLinks: menu,
    }
  },
  methods: {
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
