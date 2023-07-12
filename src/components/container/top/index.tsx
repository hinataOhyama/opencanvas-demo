import React, { useState, useEffect } from "react";
import Presentation from './Presentation'
import Query, {createSparql, sendSparqlQuery} from './query.js'

type table = {
  factor: string;
  reason: string;
  solution: string;
};

type TableList = Array<table>;

let allTableList = [
  {
      "factor": "rug47",
      "reason": "転倒の危険がある",
      "solution": "移動させる"
  },
  {
      "factor": "clothespile108",
      "reason": "転倒の危険がある",
      "solution": "移動させる"
  }
];


const TopContainer = () => {
  const openBalloon = (index: string) => {
    const target = document.getElementById(String(index));
    if(target == null) {
      return;
    } 
    else {
      target.style.visibility = "visible";
    }
  }

  const closeBalloon = (index: string) => {
    const target = document.getElementById(String(index));
    if(target == null) {
      return;
    } 
    else {
      target.style.visibility = "hidden";
    }
  }


  const [list, setList] = useState<TableList>(allTableList);
  const [tableList, setTableList] = useState<TableList>(list);

  useEffect(()=> {
    Query().then((result) => {setList(result), setTableList(result)});
  }, []);
  
  const search = (searchText: string) => {
    if (searchText !== "") {
      const filteredData = Object.entries(tableList)
      .filter(([, value]) => value.factor.includes(searchText))
      .map(([, value]) => value);
      setTableList(filteredData);
      return;
    }
    
    setTableList(list);
    return;
  };
  
  const [inputValue, setInputValue] = useState("");
  const searchHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    search(e.target.value);
  };


  const [situationUri, setSituationUri] = useState("");
  const [endPointUrl, setEndPointUrl] = useState("");
  const [currentSituationUri, setCurrentSituationUri] = useState("");

  const situationUriHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSituationUri(e.target.value);
  };

  const endPointUrlHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndPointUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const situationValue = data.get('situation');
    if (situationValue != null) {
      setSituationUri(String(situationValue));
    }
    const endPointValue = data.get('endPoint');
    if (endPointValue != null) {
      setEndPointUrl(String(endPointValue));
    }
    clickSearch(situationUri, endPointUrl);
    setCurrentSituationUri(situationUri)
  }

  const clickSearch = (situationUri: string, endPointUrl: string) => {
    Query(situationUri, endPointUrl).then((result) => {setList(result), setTableList(result)});
  };

  return (
    <Presentation
      inputValue={inputValue} 
      searchHandleChange={searchHandleChange}
      situationUri={situationUri} 
      currentSituationUri={currentSituationUri}
      endPointUrl={endPointUrl}
      situationUriHandleChange={situationUriHandleChange}
      endPointUrlHandleChange={endPointUrlHandleChange}
      handleSubmit={handleSubmit}
      tableList={tableList}
      openBalloon={openBalloon}
      closeBalloon={closeBalloon}
    />
  )
}

export default TopContainer