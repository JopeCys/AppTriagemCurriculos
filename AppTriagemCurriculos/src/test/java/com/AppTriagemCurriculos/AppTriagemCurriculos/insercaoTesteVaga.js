import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Métricas personalizadas
export const requests = new Counter('http_reqs');
export const latency = new Trend('latency');
export const throughput = new Trend('throughput');


export const options = {
    stages: [
        { duration: '30s', target: 20 },   // Aumenta para 20 usuários
        // { duration: '30s', target: 100 },   // Aumenta 100 usuários
        // { duration: '30s', target: 500 },  // Aumenta para 500 usuários
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% das requisições devem ser completadas em menos de 500ms
        'latency': ['avg<300'],           // Latência média deve ser menor que 300ms
        'throughput': ['avg>100'],              // Vazão média deve ser maior que 100 req/s
    },
};

export default function () {
    const url = 'http://localhost:8080/cadastrarVaga';
    const payload = {
        nome: `Desenvolvedor Java  ${Math.random().toString(36).substring(7)}`,
        area: `T${Math.random().toString(36).substring(7)}`,
        descricao: 'Desenvolvimento de sistemas Java'
    };

    const params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

     // Envia a requisição POST com os dados de formulário
     const res = http.post(url, payload, params);

    // Mede a latência e vazão
    latency.add(res.timings.duration);
    throughput.add(1 / res.timings.duration);

    // Verifica se o status da resposta foi 200 e se a duração foi inferior a 500ms
    check(res, {
        'status was 200': (r) => r.status === 200,
        'response time was < 500ms': (r) => r.timings.duration < 500,
    });

    // Pausa de 1 segundo entre as requisições
    sleep(1);
}
