# Nettiopsu Analytics

**Note:** Nettiopsu Analytics is not affiliated with UTU, it's just a personal project. Use it at your own risk.

## What it is

Nettiopsu Analytics is a website that parses your Nettiopsu transcript PDF for course info, then shows your current statistics like GPA, total credits and most frequent grade.
It also allows you to filter the courses by level, grade type and date, while showing stats for the selected courses.

**All the parsing and analysis is done in the browser, so no personal data is sent or stored anywhere. The website only looks at the course data, nothing else.**

## Technologies

Nettiopsu Analytics is built using [Svelte](https://svelte.dev) and [PDF.js](https://mozilla.github.io/pdf.js/). **PDF.js** is used to extract text data from the PDF file, and **Svelte** is used to show that data beautifully.
