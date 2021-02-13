const cheerio = require("cheerio");
const fs = require("fs");

const html = fs.readFileSync("japan.html", "utf-8");
const $ = cheerio.load(html);
const levels = $(".course-lesson__course");
let data = {};

levels.each((_, level) => {
  const levelName = $(".course-lesson__course-title", level)
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .trim();
  data[levelName] = [];
  const lessons = $(".course-lesson__wrap", level);

  lessons.each((_, lesson) => {
    const lessonName = $(".course-lesson__head-title", lesson).text().trim();
    data[levelName].push(lessonName);
  });

  console.log(data);
});

fs.writeFileSync("busuu.json", JSON.stringify(data), "utf8");
