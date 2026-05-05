<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Shield\Models\UserModel;

/**
 * Endpoints de autenticación para el frontend React.
 *
 * Flujo:
 *  1. Frontend POST /api/v1/auth/login con {email, password}
 *  2. Backend valida con Shield, genera token con generateAccessToken()
 *  3. Frontend guarda el token y lo envía en cada request:
 *     Authorization: Bearer <raw_token>
 *  4. POST /api/v1/auth/logout revoca el token actual
 *  5. GET  /api/v1/auth/me devuelve el usuario autenticado
 */
class Auth extends BaseController
{
    use ResponseTrait;

    public function login(): ResponseInterface
    {
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required|min_length[6]',
        ];

        if (! $this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $credentials = [
            'email'    => $this->request->getJsonVar('email'),
            'password' => $this->request->getJsonVar('password'),
        ];

        $authenticator = auth('tokens')->getAuthenticator();
        $loginAttempt  = $authenticator->attempt($credentials);

        if (! $loginAttempt->isOK()) {
            return $this->failUnauthorized('Credenciales inválidas');
        }

        /** @var \CodeIgniter\Shield\Entities\User $user */
        $user  = $loginAttempt->extraInfo();
        $token = $user->generateAccessToken('react-spa');

        return $this->respond([
            'data' => [
                'token' => $token->raw_token, // solo se envía una vez — el frontend lo guarda
                'user'  => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'groups'   => $user->getGroups(),
                ],
            ],
        ]);
    }

    public function logout(): ResponseInterface
    {
        $user = auth('tokens')->user();

        if ($user !== null) {
            // Revoca el token actual (el que vino en el header Authorization)
            $user->revokeAccessToken($user->currentAccessToken()->token);
        }

        return $this->respond(['data' => ['message' => 'Sesión cerrada']]);
    }

    public function me(): ResponseInterface
    {
        $user = auth('tokens')->user();

        if ($user === null) {
            return $this->failUnauthorized('No autenticado');
        }

        return $this->respond([
            'data' => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'groups'   => $user->getGroups(),
            ],
        ]);
    }
}
