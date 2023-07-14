import React, { useState, useEffect } from "react";
import Presentation from "./Presentation";
import { GETid, WikipediaPageviewsRanking, WikipediaArticle } from "./query";

const TopContainer = () => {
  const [value, setValue] = useState("2023-07-08");
  const [wikipediaRankingHtml, setWikipediaRankingHtml] = useState<
    {
      rank: string;
      img: string;
      article: string;
      categories: string;
      views: string;
      wikipediaUrl: string;
      dbpediaUrl: string;
      wikidataUrl: string;
    }[]
  >([]);
  const clickButton = () => {
    main();
  };
  const sleep = (ms: number) =>
    new Promise((reserve) => setTimeout(reserve, ms));
  async function main() {
    const date = value.replaceAll("-", "/");
    console.log(date);
    const wikipediaPageviewsRanking = new WikipediaPageviewsRanking(date);
    const wikipediaPageviewsData =
      await wikipediaPageviewsRanking.fetchWikipediaPageviews();
    const articles = wikipediaPageviewsData["items"][0]["articles"];
    console.log(articles);
    let wikipediaPageView = [];
    let twoDimensionsArticles = [];
    const divisionNum = 25;
    for (let i = 0; i < 50; i += divisionNum) {
      twoDimensionsArticles.push(articles.slice(i, i + divisionNum));
    }
    console.log(twoDimensionsArticles);

    for (const articleArray of twoDimensionsArticles) {
      console.log(articleArray);
      wikipediaPageView.push(
        await Promise.all(
          articleArray.map(async (article) => {
            const wikipediaArticle = new WikipediaArticle(
              encodeURI(article["article"])
            );
            const info =
              await wikipediaArticle.fetchWikidataInfoFromWikipediaUrl();
            console.log(info);
            const wikipediaUrl = wikipediaArticle.wikipediaUrl;
            const dbpediaUrl = wikipediaArticle.dbpediaUrl;
            const wikidataUrl = info["wikidataUrl"];
            const imgUrl = info["imgUrl"];
            console.log(wikidataUrl);
            console.log(imgUrl);
            return {
              rank: article["rank"] + "位",
              img: imgUrl,
              article: article["article"],
              categories: info["categories"],
              views: article["views"],
              wikipediaUrl: wikipediaUrl,
              dbpediaUrl: dbpediaUrl,
              wikidataUrl: wikidataUrl,
            };
          })
        )
      );
      await sleep(1000);
    }
    wikipediaPageView = wikipediaPageView.flat();
    console.log(wikipediaPageView);

    let humanOnlyWikipediaPageviewsRanking = [];
    for (const x of wikipediaPageView) {
      if (x["wikidataUrl"] != null) {
        console.log(x["categories"]);
        const wikidataIds = x["categories"].map((categoryUrl) =>
          GETid(categoryUrl)
        );
        console.log(wikidataIds);
        console.log(x);
        if (wikidataIds.includes("Q5")) {
          humanOnlyWikipediaPageviewsRanking.push(x);
        }
      }
    }

    setWikipediaRankingHtml(humanOnlyWikipediaPageviewsRanking);
    console.log(wikipediaRankingHtml);
  }
  return (
    <Presentation
      clickButton={clickButton}
      value={value}
      setValue={setValue}
      wikipediaRankingHtml={wikipediaRankingHtml}
    />
  );
};

export default TopContainer;
