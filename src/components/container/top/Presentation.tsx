import Head from "next/head";
import Style from "./index.module.scss";
import { useState } from "react";
interface Props {
  clickButton: () => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  wikipediaRankingHtml: string[];
}

const Presentation: React.FC<Props> = (props) => {
  const [rank, setRank] = useState<string>();
  const [image, setImage] = useState<string>();
  const [article, setArticle] = useState<string>();
  const [categories, setCategories] = useState<string>();
  const [views, setViews] = useState<string>();
  const [wikipediaUrl, setWikipediaUrl] = useState<string>();
  const [dbpediaUrl, setDbpediaUrl] = useState<string>();
  const [wikidataUrl, setWikidataUrl] = useState<string>();
  const displaySideBar = (
    rank: string,
    image: string,
    article: string,
    categories: string,
    views: string,
    wikipediaUrl: string,
    dbpediaUrl: string,
    wikidataUrl: string
  ) => {
    setRank(rank);
    setImage(image);
    setArticle(article);
    setCategories(categories);
    setViews(views);
    setWikipediaUrl(wikipediaUrl);
    setDbpediaUrl(dbpediaUrl);
    setWikidataUrl(wikidataUrl);
  };

  const [selectedElement, setSelectedElement] = useState<number>();

  const handleElementClick = (index: number) => {
    if (selectedElement !== index) {
      setSelectedElement(index);
    }

    console.log(selectedElement, index);
  };

  return (
    <>
      <Head>
        <title>オープンキャンパス2023デモ</title>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="推論チャレンジ2023" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
        />
      </Head>
      <div className={Style.wrapper}>
        <div className={Style.container}>
          <h1>オープンキャンパス2023デモ</h1>
          <div className={Style.image_top}>
            <img src="\assets\img\top.jpg" alt="" />
          </div>
          <p className={Style.caption}>
            引用：
            <a href="https://www.osakac.ac.jp/">
              つなぐ知 かなえる技 大阪電気通信大学 Osaka Electro-Communication
              University
            </a>
          </p>
          <div className={Style.search}>
            <input
              type="date"
              name=""
              id="date"
              value={props.value}
              onChange={(e) => props.setValue(e.target.value)}
            />
            <button
              id="displayWikipediaPageviewButton"
              onClick={props.clickButton}
            >
              wikipediaPageview表示
            </button>
          </div>
          <div className={Style.inner}>
            <div className={Style.mainContent}>
              {props.wikipediaRankingHtml.map((v, i) => {
                return (
                  <div
                    key={i}
                    className={`${Style.item} ${i == selectedElement && Style.selectedElement}`}
                    onClick={() =>
                      { 
                        handleElementClick(i);
                        displaySideBar(
                          v.rank,
                          v.img,
                          v.article,
                          v.categories,
                          v.views,
                          v.wikipediaUrl,
                          v.dbpediaUrl,
                          v.wikidataUrl
                        );
                      }
                    }
                  >
                    <div className={Style.image}>
                      <img src={v.img} alt="" />
                    </div>
                    <div className={Style.profile}>
                      <div className={Style.rank}>{v.rank}</div>
                      <div className={Style.name}>{v.article}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={Style.sideBar}>
              {props.wikipediaRankingHtml.length > 0 && (
                <>
                  <div className={Style.articles}>名前：{article}</div>
                  <div className={Style.rank}>ランク：{rank}</div>
                  <div className={Style.categories}>
                    カテゴリー：{categories}
                  </div>
                  <div className={Style.views}>ビュー：{views}</div>
                  <div className={Style.icon_wrapper}>
                    <div className={Style.icon}>
                      <a href={wikipediaUrl}>
                        <img src="\assets\img\Wikipedia_icon.png" alt="" />
                        <p>wikipedia</p>
                      </a>
                    </div>
                    <div className={Style.icon}>
                      <a href={dbpediaUrl}>
                        <img src="\assets\img\dbpedia_icon.png" alt="" />
                        <p>dbpedia</p>
                      </a>
                    </div>
                    <div className={Style.icon}>
                      <a href={wikidataUrl}>
                        <img src="\assets\img\Wikidata_icon.png" alt="" />
                        <p>wikidata</p>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Presentation;
