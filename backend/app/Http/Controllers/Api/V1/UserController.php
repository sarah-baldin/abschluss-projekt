<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Get all users method
    public function index()
    {
        $users = User::all();

        return response()->json($users);
    }

    // Update user data method
    public function update(UpdateUserRequest $request, $id, User $user)
    {
        // Authorize the update action using the UserPolicy
        $this->authorize('update', [$request->user(), $user]);

        $data = $request->validated();

        $userToUpdate = User::findOrFail($id);

        // Update user attributes based on the provided data
        $userToUpdate->update([
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'],
            'admin' => $data['admin'],
            'role' => $data['role'],
            'email' => $data['email'],
        ]);

        // Check if a new password is provided and update it
        if (isset($data['password'])) {
            $userToUpdate->update([
                'password' => Hash::make($data['password']),
            ]);
        }

        // Return a response indicating success
        return response()->json([
            'user' => new UserResource($userToUpdate),
            'message' => 'User updated successfully!',
        ]);
    }

    // delete user method
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
