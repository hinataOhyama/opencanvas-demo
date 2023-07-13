async function fetchSparql(endpointUrl, sparqlQuery) {
  const fullUrl = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);
  const headers = {
    Accept: 'application/sparql-results+json',
  };
  return fetch(fullUrl, { headers, method: 'GET', mode: 'cors' })
    .then((body) => {
      if (!body.ok) {
        console.error('サーバーエラー');
      }
      return body.json();
    })
    .catch((error) => {
      console.error('通信に失敗しました', error);
    });
}

function GETid(url) {
  const regex = /(Q\d+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  } else {
    console.log('一致する部分が見つかりませんでした');
    return null;
  }
}

async function getProperty1(wikidataId) {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const query = `SELECT ?o ?oLabel ?o1 ?o1Label ?o2 ?o2Label ?o3 ?o3Label ?o4 ?o4Label
  WHERE {
    OPTIONAL{wd:${wikidataId} wdt:P21 ?o}.
    OPTIONAL{wd:${wikidataId} wdt:P106 ?o1}.
    OPTIONAL{wd:${wikidataId} wdt:P1559 ?o2}.
    OPTIONAL{wd:${wikidataId} wdt:P569 ?o3}.
    OPTIONAL{wd:${wikidataId} wdt:P18 ?o4}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja". }
  }`;
  console.log(query);
  let resultquery = await fetchSparql(endpointUrl, query);
  return resultquery;
}

class WikipediaArticle {
  #wikidataId = '';

  constructor(articleName) {
    this.articleName = articleName;
  }

  get wikipediaUrl() {
    return this.wikipediaUrlFromArticle();
  }

  get dbpediaUrl() {
    return this.dbpediaUrlFromArticle();
  }
  get wikidataId() {
    return this.#wikidataId;
  }

  wikipediaUrlFromArticle() {
    return 'https://ja.wikipedia.org/wiki/' + this.articleName;
  }

  dbpediaUrlFromArticle() {
    return 'https://dbpedia.org/resource/' + this.articleName;
  }

  async fetchWikidataUrlFromWikipediaUrl() {
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const query = `PREFIX schema: <http://schema.org/>
        PREFIX wd: <http://www.wikidata.org/entity/>
        select ?o where {
          <${this.wikipediaUrl}> schema:about ?o ;
             schema:inLanguage 'ja' ;
             schema:isPartOf <https://ja.wikipedia.org/> .
        }LIMIT 1
        `;
    const result = await fetchSparql(endpointUrl, query);
    if (result['results']['bindings'][0] != null) {
      this.#wikidataId = GETid(result['results']['bindings'][0]['o']['value']);
      return result['results']['bindings'][0]['o']['value'];
    } else {
      return null;
    }
  }
  async fetchWikidataInfoFromWikipediaUrl() {
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const query = `PREFIX schema: <http://schema.org/>
        PREFIX wd: <http://www.wikidata.org/entity/>
        select ?wikidataUrl ?img ?category where {
          <${this.wikipediaUrl}> schema:about ?wikidataUrl ;
             schema:inLanguage 'ja' ;
             schema:isPartOf <https://ja.wikipedia.org/> .
             OPTIONAL{?wikidataUrl wdt:P18 ?img}.
             OPTIONAL{?wikidataUrl wdt:P31 ?category}.
        }LIMIT 1
        `;
    const result = await fetchSparql(endpointUrl, query);
    if (result['results']['bindings'][0] != null) {
      const wikidataUrl =
        result['results']['bindings'][0]['wikidataUrl']['value'];
      const imgUrl = result['results']['bindings'][0]['img']
        ? result['results']['bindings'][0]['img']['value']
        : null;
      const categories = result['results']['bindings']
        .map((binding) => {
          return binding['category']
            ? result['results']['bindings'][0]['category']['value']
            : null;
        })
        .filter((x) => x != null);
      return {
        wikidataUrl: wikidataUrl,
        imgUrl: imgUrl,
        categories: categories,
      };
    } else {
      return {
        wikidataUrl: null,
        imgUrl: null,
        categories: [],
      };
    }
  }
}

class WikipediaPageviewsRanking {
  constructor(targetDateStr) {
    this.targetDateStr = targetDateStr;
  }
  #apiUrl =
    'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ja.wikipedia/all-access/';

  #isDateBefore(baseDateStr, targetDateStr) {
    //引数はYYYY/MM/DD の形式
    const baseDateArray = baseDateStr.split('/');
    const baseDate = new Date(
      baseDateArray[0],
      baseDateArray[1] - 1,
      baseDateArray[2]
    );
    const targetDateArray = targetDateStr.split('/');
    const targetDate = new Date(
      targetDateArray[0],
      targetDateArray[1] - 1,
      targetDateArray[2]
    );
    return baseDate < targetDate;
  }

  fetchWikipediaPageviews() {
    //引数はYYYY/MM/DD の形式
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const twoDaysAgoDateStr = `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    if (this.#isDateBefore(twoDaysAgoDateStr, this.targetDateStr)) {
      console.log('2日前以降になってます。');
      return new RangeError(
        '日付は今日の日付から2日前以前の範囲で指定してください'
      );
    }

    const headers = {
      Accept: 'application/sparql-results+json',
    };
    return fetch(this.#apiUrl + this.targetDateStr, {
      headers,
      method: 'GET',
      mode: 'cors',
    })
      .then((response) => {
        if (!response.ok) {
          console.error('サーバーエラー');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('通信に失敗しました', error);
      });
  }
}

export { GETid, WikipediaPageviewsRanking, WikipediaArticle };