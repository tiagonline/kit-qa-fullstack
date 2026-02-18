import http from "k6/http";
import { check, fail } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = __ENV.K6_BASE_URL;

export let getDuration = new Trend("_1_duration");
export let getReqs = new Rate("_2_reqs");
export let getSuccessRate = new Rate("_3_success_rate");
export let getFailRate = new Rate("_4_fail_rate");

export default class getRequest {
  get() {
    let res = http.get(`${BASE_URL}/get`);

    check(res, {
      "status is 200": (r) => r.status === 200,
    });

    getDuration.add(res.timings.duration);
    getReqs.add(1);
    getSuccessRate.add(res.status < 399);
    getFailRate.add(res.status == 0 || res.status > 399);

    if (!check(res, { "max duration": (r) => r.timings.duration < 10000 })) {
      fail("Max Duration 10s");
    }
  }
}
