import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics untuk melacak error rate
export const errorRate = new Rate('errors');
export const successCounter = new Counter('successful_requests');

export const options = {
  // Simulasi: Jalankan 20 Virtual Users (VU) secara konstan selama 1 menit
  // (Waktu ini cukup untuk kamu mentrigger deploy di GitHub Actions di tengah-tengah test)
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up ke 20 user dalam 10 detik
    { duration: '40s', target: 20 }, // Stabil di 20 user selama 40 detik (Waktu ideal buat rilis code!)
    { duration: '10s', target: 0 },  // Ramp-down kembali ke 0
  ],
  thresholds: {
    // Target sukses: Error rate harus 0% atau sangat mendekati 0
    'errors': ['rate<0.01'], 
  },
};

export default function () {
  const url = 'http://localhost/'; // Target ke NGINX local kamu
  const res = http.get(url);

  // Cek apakah respons sukses (status 200) dan body-nya valid
  const isSuccess = check(res, {
    'status is 200': (r) => r.status === 200,
    'response contains version': (r) => r.body.includes('version'),
  });

  if (!isSuccess) {
    errorRate.add(1);
    console.error(`ERROR DETECTED: Status ${res.status} | Body: ${res.body}`);
  } else {
    successCounter.add(1);
    errorRate.add(0);
  }

  // Jeda kecil antar request per user
  sleep(0.1); 
}
