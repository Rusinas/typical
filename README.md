## Typical

Well, here is my attempt to make a Notion-like rich text editor plugin for Vue.js 3.
It was an interesting journey, but a little bit too much for one person, especially when it comes to cross-browser/cross-platform compatibility, accessibility, and stuff like that.

The main goal behind all this was to create an easily extensible editor to use in my projects, since almost every one of them is based on some sort of text editing (my blog, my future task management app, my almost-ready note-taking app), and I wanted control over every little thing in it (that's why I didn't use existing solutions - it's a nightmare to customize them).

This is where my approach shines - extending the editor using plain Vue components is such a killer feature (speaking from my experience with other editors). It opens so many opportunities that I can't even describe.

But, despite it being the 4th or even 5th iteration (read: written from scratch considering all the previous mistakes), there are still a lot of architectural 'nuances', so I believe it would be hard for someone else to understand. Even I don't understand what's going on now (mostly), because the last time I touched it was ~6 months ago.

Well, I don't regret spending 4 years on this. I learned a lot. And I don't regret switching to another editor for my projects, because my time is limited and I want to build useful apps already. But I believe that the ideas I put here have some potential, and maybe someone would want to join me to continue? A great opportunity to become an open source contributor, I would say 😉

## Demo

You can find the demo here: https://rusinas.github.io/typical (works correctly only in Google Chrome, but has some minor bugs)