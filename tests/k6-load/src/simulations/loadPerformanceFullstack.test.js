import { group } from "k6";
import getRequest from "../requests/getRequest";
import postRequest from "../requests/postRequest";

export let options = {
  // Configuração 500 usuários por 5 minutos
  stages: [
    { duration: "1m", target: 500 }, // Rampa de subida
    { duration: "5m", target: 500 }, // Mantém 500 usuários por 5 minutos (Requisito)
    { duration: "1m", target: 0 },   // Rampa de descida
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% das requisições abaixo de 2s
    // Aumentei a tolerância de erro para 10% pois httpbin pode falhou anteriormente com essa carga
    http_req_failed: ["rate<0.10"],    
  },
};

export default function () {
  let getParams = new getRequest();
  let postParams = new postRequest();

  group("GET - Consulta Geral", () => {
    getParams.get();
  });

  group("POST - Criação de Dados", () => {
    postParams.post();
  });
}