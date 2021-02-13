![Nopsa logo](https://github.com/kumpmati/nopsa/blob/master/public/favicon/favicon-64.png?raw=true)

# Nopsa - Nettiopsu Analytics

**Note:** Nopsa is not affiliated with UTU, it's just a personal project. Use it at your own risk.

## What is it?

Nopsa is a web app that parses your Nettiopsu transcript of study records PDF for course info, then shows your current statistics like GPA, total credits and most frequent grade.
It also allows you to filter the courses by level, grade type and date, while showing stats for the selected courses.

**All the parsing and analysis is done in the browser, so no personal data is sent or stored anywhere. The website only looks at the course data, nothing else.**

## How to setup

1. Clone the repo to your computer
2. Run `npm install` in the repo root folder
3. Run `npm run dev` to start the dev server with hot reload


## Scripts

### `npm run dev`
  
Starts the rollup development server.

The server will autoreload when changes are detected.

### `npm run build`

Builds the application using rollup into `/public/build`.

### `npm start`

Starts the `sirv` http server and serves the contents of /public
*Note!* you need to run `npm run build` at least once before this.

## Technologies

Nopsa is built using [Svelte](https://svelte.dev) and [PDF.js](https://mozilla.github.io/pdf.js/). **PDF.js** is used to extract text data from the PDF file, and **Svelte** is used to show that data beautifully.
