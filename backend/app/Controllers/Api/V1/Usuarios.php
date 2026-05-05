<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use CodeIgniter\Shield\Models\UserModel;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Usuarios extends BaseController
{
    use ResponseTrait;

    private UserModel $model;

    public function __construct()
    {
        $this->model = model(UserModel::class);
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);

        $users = db_connect()->table('users u')
            ->select('u.id, u.username, u.empleado_id, u.active, u.last_active, ai.secret AS email')
            ->join('auth_identities ai', "ai.user_id = u.id AND ai.type = 'email_password'", 'left')
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()->getResultArray();

        $total = db_connect()->table('users')->countAllResults();

        return $this->respond([
            'data' => $users,
            'meta' => compact('page', 'perPage', 'total'),
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $user = $this->model->find($id);
        if (! $user) return $this->failNotFound('Usuario no encontrado');

        return $this->respond([
            'data' => [
                'id'          => $user->id,
                'username'    => $user->username,
                'email'       => $user->email,
                'empleado_id' => $user->empleado_id ?? null,
                'groups'      => $user->getGroups(),
                'active'      => $user->active,
            ],
        ]);
    }

    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);

        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required|min_length[8]',
            'username' => 'required|min_length[3]',
        ];
        if (! $this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $user = new \CodeIgniter\Shield\Entities\User([
            'username'    => $data['username'],
            'empleado_id' => $data['empleado_id'] ?? null,
        ]);
        $user->setPassword($data['password']);

        $this->model->save($user);
        $user = $this->model->findById($this->model->getInsertID());
        $user->createEmailIdentity(['email' => $data['email'], 'password' => $data['password']]);

        if (! empty($data['groups'])) {
            $user->addToDefaultGroup();
            foreach ((array) $data['groups'] as $g) {
                $user->addGroup($g);
            }
        } else {
            $user->addToDefaultGroup();
        }

        return $this->respondCreated([
            'data' => ['id' => $user->id, 'username' => $user->username],
        ]);
    }

    public function update(int $id): ResponseInterface
    {
        $user = $this->model->find($id);
        if (! $user) return $this->failNotFound('Usuario no encontrado');

        $data = $this->request->getJSON(true);

        if (! empty($data['username'])) {
            $user->fill(['username' => $data['username']]);
        }
        if (! empty($data['empleado_id'])) {
            db_connect()->table('users')->where('id', $id)->update(['empleado_id' => $data['empleado_id']]);
        }
        if (! empty($data['password'])) {
            $user->setPassword($data['password']);
        }

        $this->model->save($user);

        return $this->respond(['data' => ['message' => 'Usuario actualizado']]);
    }

    public function delete(int $id): ResponseInterface
    {
        $user = $this->model->find($id);
        if (! $user) return $this->failNotFound('Usuario no encontrado');

        $this->model->delete($id);
        return $this->respondDeleted(['data' => ['message' => 'Usuario eliminado']]);
    }
}
