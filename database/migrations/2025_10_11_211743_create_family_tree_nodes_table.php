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
        Schema::create('family_tree_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arbol_id')->constrained('arboles')->onDelete('cascade');
            $table->string('node_key')->index(); // Clave única del nodo en GoJS
            $table->string('name');
            $table->string('gender')->default('M');
            $table->string('birth_date')->nullable(); // yyyy-MM-dd o solo yyyy
            $table->string('death_date')->nullable(); // yyyy-MM-dd o solo yyyy
            $table->string('img')->nullable();
            $table->json('node_data')->nullable(); // Datos completos del nodo GoJS
            $table->json('position')->nullable(); // Posición X,Y del nodo
            $table->timestamps();
            
            // Índices para optimización
            $table->unique(['arbol_id', 'node_key']); // Una clave única por árbol
            $table->index(['arbol_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_tree_nodes');
    }
};
