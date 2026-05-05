<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin  = $request->getHeaderLine('Origin');
        $allowed = $this->allowedOrigins();

        if ($origin === '' || ! in_array($origin, $allowed, true)) {
            return null;
        }

        $response = service('response');
        $response->setHeader('Access-Control-Allow-Origin',      $origin);
        $response->setHeader('Access-Control-Allow-Credentials', 'true');
        $response->setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers',     'Content-Type, Authorization, X-Requested-With');
        $response->setHeader('Access-Control-Max-Age',           '86400');

        if ($request->getMethod() === 'OPTIONS') {
            return $response->setStatusCode(204);
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }

    private function allowedOrigins(): array
    {
        $env = env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173');
        return array_map('trim', explode(',', $env));
    }
}
