<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('family_tree_nodes', function (Blueprint $table) {
            if (!Schema::hasColumn('family_tree_nodes', 'nationality')) {
                $table->json('nationality')->nullable()->after('death_city');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_tree_nodes', function (Blueprint $table) {
            if (Schema::hasColumn('family_tree_nodes', 'nationality')) {
                $table->dropColumn('nationality');
            }
        });
    }
};
