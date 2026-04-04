import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
	insecureSkipTLSVerify: true,
	stages: [
		{ duration: '30s', target: 20 },
		{ duration: '1m', target: 50 },
		{ duration: '2m', target: 100 },
		{ duration: '3m', target: 150 },
		{ duration: '2m', target: 150 },
		{ duration: '1m', target: 0 },
	],
	thresholds: {
		http_req_failed: ['rate<0.05'],
		http_req_duration: ['p(95)<3000'],
		checks: ['rate>0.95'],
	},
};

const BASE_URL = __ENV.BASE_URL || 'https://snowflake.dev.local';
const TARGET_PATH = __ENV.TARGET_PATH || '/';
const EXPECTED_STATUS = Number(__ENV.EXPECTED_STATUS || 200);

export default function () {
	const res = http.get(`${BASE_URL}${TARGET_PATH}`, {
		headers: {
			Accept: 'text/html,application/json,text/plain,*/*',
		},
		tags: {
			endpoint: TARGET_PATH,
			ingress_host: 'snowflake.dev.local',
			method: 'GET',
		},
	});

	check(res, {
		'status is 200': (r) => r.status === EXPECTED_STATUS,
		'response time < 5000ms': (r) => r.timings.duration < 5000,
		'body is not empty': (r) => r.body && r.body.length > 0,
	});

	sleep(0.1);
}
