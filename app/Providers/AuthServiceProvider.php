<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Arbol;
use App\Policies\ArbolPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Arbol::class => ArbolPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}
