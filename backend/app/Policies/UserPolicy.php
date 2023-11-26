<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $loggedInUser  The currently authenticated user
     * @param  \App\Models\User  $user  The user being updated
     * @return mixed
     */
    public function update(User $loggedInUser, User $user)
    {
        // Only allow admins to update users
        return $loggedInUser->admin === 1 || $loggedInUser->id == $user->id;
    }
}
