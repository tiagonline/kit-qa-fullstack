import { group } from "k6";
import getRequest from "../requests/getRequest";
import postRequest from "../requests/postRequest";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Environment-specific thresholds: stricter for local development, relaxed for CI
const isCI = __ENV.CI === "true" || __ENV.GITHUB_ACTIONS === "true";
const p95Threshold = isCI ? 2500 : 2000; // CI containers have higher latency
const errorRateThreshold = isCI ? 0.15 : 0.10; // CI may have more network collisions

export let options = {
  stages: [
    { duration: "10s", target: 20 },
    { duration: "30s", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${p95Threshold}`],
    http_req_failed: [`rate<${errorRateThreshold}`],
  },
};

export default function () {
  let getParams = new getRequest();
  let postParams = new postRequest();

  group("Fluxo: Consulta Geral (GET)", () => {
    getParams.get();
  });

  group("Fluxo: Criação de Dados (POST)", () => {
    postParams.post();
  });
}

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data), 
    "k6-summary.json": JSON.stringify(data),
  };
}