<template>
  <footer>
    <div class="flex flex-col items-center mt-16">
      <div class="flex mb-3 space-x-4">
        <a
          class="text-sm text-gray-500 transition hover:text-gray-600"
          target="_blank"
          rel="noopener noreferrer"
          :href="author.socials.linkedin"
        ><span class="sr-only">Linkedin</span>
          <LinkedingIcon class="w-8 h-8 text-black" />
        </a>
        <a
          class="text-sm text-gray-500 transition hover:text-gray-600"
          target="_blank"
          rel="noopener noreferrer"
          :href="author.socials.instagram"
        ><span class="sr-only">Instagram</span>
          <InstagramIcon class="w-8 h-8 text-black" />
        </a><a
          class="text-sm text-gray-500 transition hover:text-gray-600"
          target="_blank"
          rel="noopener noreferrer"
          :href="`mailto:${author.email}`"
        ><span class="sr-only">mail</span>
          <MailIcon class="w-8 h-8 text-black" />
        </a>
      </div>
      <div class="flex mb-2 space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div>Copyright © {{ 2024 }}</div>
        <div>•</div>
        <a
          href="/"
        >{{ author.name }}'s blog - {{ siteMetaInfo.slogan }}</a>
      </div>
      <div class="mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/mdrathik/tailwind-nuxtjs-starter-blog"
        />
      </div>
    </div>
  </footer>
</template>

<script setup>
import siteMetaInfo from "@/data/sitemetainfo"
import author from "@/data/author.js"
import MailIcon from "assets/icons/mail.svg?component"
import LinkedingIcon from "assets/icons/linkeding.svg?component"
import GithubNewIcon from "assets/icons/github_new.svg?component"
import InstagramIcon from "assets/icons/instagram.svg?component"
</script>
