const risks = {
  "床に0.4m以下のオブジェクトがある": {
    riskState: {
      高さ: {
        value: "0.4",
        unit: "m",
        operator: "<=",
      },
      on: "state2",
    },
    state2: {
      object: "Floor",
    },
  },
  床が汚れている: {
    riskState: {
      object: "Floor",
      state: "DIRTY",
    },
  },
  "0.3m以上の高さをもつベッド": {
    riskState: {
      object: "Bed",
      高さ: {
        value: "0.3",
        unit: "m",
        operator: ">=",
      },
    },
  },
};
const solutions = {
  "0.3m以上の高さをもつベッド":
    "転落時の衝撃を緩和するため、低床のベッドにする",
  "床に0.4m以下のオブジェクトがある": "移動させる",
  床が汚れている: "掃除する",
};
const reasons = {
  "0.3m以上の高さをもつベッド":
    "転落の危険がある",
  "床に0.4m以下のオブジェクトがある": "転倒の危険がある",
  床が汚れている: "転倒の危険がある",
}

function bindSituation(stateName, situationUri) {
  const stateNameVar = "?" + stateName;

  return stateNameVar + " vh2kg:partOf " + situationUri + ".";
}

function height(stateName, value, operator) {
  const heightVar = "?" + stateName + "_height";
  const stateNmeVar = "?" + stateName;
  return (
    stateNmeVar +
    " vh2kg:bbox [x3do:bboxSize [rdf:rest [rdf:first " +
    heightVar +
    " ]]] . FILTER (" +
    heightVar +
    " " +
    operator +
    " " +
    value +
    ")"
  );
}

function object(stateName, object) {
  const stateNameVar = "?" + stateName;
  return stateNameVar + " vh2kg:isStateOf [a vh2kg:" + object + "] .";
}

function on(stateName, targetStateName) {
  const stateVarName = "?" + stateName;
  const targetStateVarName = "?" + targetStateName;
  const targetShapeVarName = "?" + targetStateName + "_shape";
  return (
    targetStateVarName +
    " vh2kg:bbox " +
    targetShapeVarName +
    " . " +
    stateVarName +
    " vh2kg:bbox [vh2kg:on " +
    targetShapeVarName +
    "] ."
  );
}
function state(stateName, stateType) {
  const stateNameVar = "?" + stateName;
  return stateNameVar + " vh2kg:state vh2kg:" + stateType + ".";
}

export const createSparql = (states, situationUri) => {
  let sparqlQuery = "";

  Object.keys(states).map((stateName) => {
    sparqlQuery += bindSituation(stateName, situationUri);
    const factors = states[stateName];
    Object.keys(factors).map((factor) => {
      if (factor == "object") {
        sparqlQuery += object(stateName, factors[factor]);
      } else if (factor == "高さ") {
        sparqlQuery += height(
          stateName,
          factors[factor].value,
          factors[factor].operator
        );
      } else if (factor == "on") {
        sparqlQuery += on(stateName, factors["on"]);
      } else if (factor == "state") {
        sparqlQuery += state(stateName, factors["state"]);
      } else {
        console.log("まだ実装できてないです。" + factor);
      }
    });
  });
  return sparqlQuery;
};

export const sendSparqlQuery = async (endpointUrl, sparqlQuery) => {
  const fullUrl =
    endpointUrl + "?query=" + encodeURIComponent(sparqlQuery);
  const headers = {
    Accept: "application/sparql-results+json",
  };
  return fetch(fullUrl, { headers, method: "GET", mode: "cors" }).then(
    (body) => body.json()
  );
};

async function riskDetection(riskSituation, situationUri, endpointUrl) {
  const sparqlQuery =
    `PREFIX vh2kg: <http://example.org/virtualhome2kg/ontology/>
PREFIX x3do: <https://www.web3d.org/specifications/X3dOntology4.0#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://example.org/virtualhome2kg/instance/>
select * where {` +
    createSparql(riskSituation, situationUri) +
    `}`;

  const queryResult = await sendSparqlQuery(endpointUrl, sparqlQuery);
  const result = queryResult["results"]["bindings"].map((x) => {
    return x["riskState"]["value"];
  });
  return result;
}

const extractObjectName = (URI) => {
  const objectNameRegEx = new RegExp(
    "instance/state[0-9]+_([0-9a-zA-Z]+)_[0-9a-zA-Z_]*"
  );
  const objectName = URI.match(objectNameRegEx)[1];
  return objectName;
};

async function hoge(riskSituation, riskName, situationUri, endpointUrl) {
  let results = await riskDetection(riskSituation, situationUri, endpointUrl);
  return results.map((y) => {
    return {
      factor: extractObjectName(y),
      reason: reasons[riskName],
      solution: solutions[riskName],
    };
  });
}

export default async function main(situationUri =
  "ex:home_situation0_relax_on_sofa_while_watching_television2_scene7", endpointUrl = "http://kozaki-lab.osakac.ac.jp/agraph/kgrc4si") {
  
  const result = await Promise.all(
    Object.keys(risks).map((riskName) => {
      const riskSituation = risks[riskName];
      return hoge(riskSituation, riskName, situationUri, endpointUrl)
    })
  ).then((x) => x.flat());
  return result;
}