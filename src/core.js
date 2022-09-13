const cheerio = require("cheerio");
const jsonic = require("jsonic");

class gImages {
  static baseUrl = "https://www.google.com/search?tbm=isch&q=";
  static async fetch(
    snowflake,
    safeSearch = false,
    userAgent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0"
  ) {
    if (
      !(snowflake && typeof snowflake === "string" && snowflake?.trim() !== "")
    )
      return undefined;
    let rawData = await fetch(
      gImages.baseUrl + snowflake + (Boolean(safeSearch) ? "&safe=active" : ""),
      { headers: { "User-Agent": userAgent } }
    )
      .then(async (r) => await r?.text())
      .then((data) =>
        cheerio
          .load(
            data,
            null,
            false
          )(
            // parse HTML
            "script"
          ) // find script tags
          .toArray() // convert cheerio list to array
          .map((script) => script.children[0]?.data) // map script tags to their inline code
          .filter((script) => script?.startsWith("AF_initDataCallback")) // find script that contains init data
          .map((script) =>
            script.slice("AF_initDataCallback(".length, -");".length)
          ) // remove call to init function
          .map(jsonic) // jsonic is used because JSON.parse() requires strict JSON and eval() allows remote code execution
          .find((data) => data.key == "ds:1") // for some reason there are two init datas, one is empty tho
          .data[31][0][12][2].map(
            (elem) =>
              elem[1] &&
              new Object({
                image: {
                  url: elem[1][3][0],
                  size: {
                    width: elem[1][3][2],
                    height: elem[1][3][1],
                  },
                },
                preview: {
                  url: elem[1][2][0],
                  size: {
                    width: elem[1][2][2],
                    height: elem[1][2][1],
                  },
                },
                color: elem[1][6],
                link: elem[1][9][2003][2],
                title: elem[1][9][2003][3],
              })
          )
          .filter((elem) => elem)
      )
      ?.catch(console.log);
    console.log(rawData);
  }
}

gImages.fetch("minecrat");
