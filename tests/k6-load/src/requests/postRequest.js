import http from "k6/http";
import { check, fail, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = __ENV.K6_BASE_URL;

export let postDuration = new Trend("_1_duration_post");
export let postReqs = new Rate("_2_reqs_post");
export let postSuccessRate = new Rate("_3_success_rate_post");
export let postFailRate = new Rate("_4_fail_rate_post");

export default class postRequest {
  post() {
    let params = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer xpto",
      },
    };

    let body = JSON.stringify({
      consumerId: "123",
      profileId: "456",
      customProperties: {
        login: "k6_user",
        data: "teste_carga",
      },
    });

    let res = http.post(`${BASE_URL}/post`, body, params);

    check(res, {
      "status is 200": (r) => r.status === 200,
    });

    // Atualiza as métricas
    postDuration.add(res.timings.duration);
    postReqs.add(1);
    postSuccessRate.add(res.status < 399);
    postFailRate.add(res.status == 0 || res.status > 399);

    if (!check(res, { "max duration": (r) => r.timings.duration < 10000 })) {
      fail("Max Duration 10s");
    }

    sleep(1);
  }
}
