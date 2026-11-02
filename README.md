# Lily Biros Portfolio

The source for my personal website: **[lilybiros.com](https://lilybiros.com)**

I work in digital communications, and I built this site to show my work and to learn how websites really get made. I have no coding background, so I directed the build using AI assistance (Claude Code), reviewing each version and deciding what to change.

## The brief

| | |
|---|---|
| **Goal** | Replace a template portfolio with a site I own and can keep editing |
| **Audience** | Recruiters and hiring managers first, then people curious about my creative projects |
| **Message** | I make technical work easy to understand, and I'm curious enough to learn new tools |

## Decisions I made

- **Two pages with two personalities.** The portfolio is bright and professional. Recreation inverts to black, so the shift from work to personal projects is obvious at a glance.
- **Motion with a purpose.** Headings scramble into place and a network of points drifts behind the page, which suits a communicator who enjoys technology. People who ask their device to reduce motion don't get these animations.
- **A logo people can play with.** Visitors can poke and drag the mascot. It's a small moment that makes the site memorable.
- **Designed for phones too.** On small screens, cards stay side by side and swipe sideways, so the layout still feels like the desktop version.

## Built to be found

- A sitemap, robots file and canonical addresses, so search engines know which pages are official
- Page titles and descriptions written around what I do
- Structured data that describes who I am
- Descriptions on images

## How it's built

- Plain HTML, CSS and JavaScript, so I can edit any page without a build step
- Hosted on Cloudflare, with HTTPS enforced and security headers set in `public/_headers`

```
public/
  index.html             portfolio
  recreation/index.html  channels, self hosting and creative tools
  styles.css             the look of every page
  main.js                animations and interactions
  assets/                logos
  photos/                my photos
```

## What I learned

- Writing a clear brief matters as much with AI as it does with an agency. Vague feedback gets vague results.
- Testing on a real phone catches problems a desktop preview misses.
- Security and search are communication problems too: each one depends on telling browsers and search engines exactly what you mean.

## Notes

This repo is a public copy of the site's files. The live site deploys from a separate private repo, so this copy can lag behind it. The photos on the Projects section are stock images from Unsplash for now.

The code is here for you to look through. My name, logos, photos and writing are mine, so please don't reuse them.
