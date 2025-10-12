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
        Schema::create('family_tree_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arbol_id')->constrained('arboles')->onDelete('cascade');
            $table->string('from_node'); // Clave del nodo origen
            $table->string('to_node');   // Clave del nodo destino
            $table->string('relationship_type'); // 'parent', 'spouse', 'child', etc.
            $table->json('link_data')->nullable(); // Datos del link GoJS
            $table->timestamps();
            
            // Índices
            $table->index(['arbol_id', 'from_node']);
            $table->index(['arbol_id', 'to_node']);
            $table->index(['arbol_id', 'relationship_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_tree_links');
    }
};
