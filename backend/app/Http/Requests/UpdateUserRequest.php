<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Only allow the user to update their own profile or all, if admin
        /* return $this->user()->isAdmin() || $this->user()->id == $this->route('user')->id; */
        return  $this->user()->isAdmin() || $this->user()->id == $this->route('user')->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        $user = $this->route('user'); // Get the user ID from the route parameters

        return [
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'admin' => 'required|boolean',
            'role' => 'required|string|max:2',
            'email' => 'required|email',
            'password' => [
                'sometimes', // Only validate if the field is present in the request
                'string',
                Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised(),
                'confirmed',
            ],
        ];
    }
}
