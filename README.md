This is a [Next.js](https://nextjs.org/) project using the App Router.

# Busg

Keep track of real-time bus arrival timings all over Singapore.

## Getting Started

Ensure location services are enabled on your device (the map falls back to Marina Bay if you deny access).
Navigate to the app [here](https://busg.vercel.app).

Start by clicking on:

1. The search icon on the top-left, or
1. Any bus stop icon on the map

## Local development

1. Copy `.env.example` to `.env.local` and fill in:
   - `LTA_API_KEY` -- from the [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html)
   - `NEXT_PUBLIC_MAPBOX_KEY` -- a public token from [Mapbox](https://account.mapbox.com/)
2. `npm install`
3. `npm run dev`

## Features

- Search by bus stop name
- Search by bus stop number
- Tap a bus stop on the map for its live arrivals

## Tools & Frameworks

- [Next.js](https://nextjs.org) (App Router) and [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/) and [SCSS](https://sass-lang.com/)
- [Chakra UI v3](https://chakra-ui.com), a component library for React applications
- [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) for the interactive map
- **Real-time** bus arrival data from the [LTA DataMall API](https://datamall.lta.gov.sg/content/datamall/en.html)

**Deployed by [Vercel](https://vercel.com)**

> Migrating from an earlier version of this app? Rename the `NEXT_PUBLIC_LTA_API_KEY`
> environment variable to `LTA_API_KEY` in your deployment settings -- it's now
> server-only and no longer needs the `NEXT_PUBLIC_` prefix.
