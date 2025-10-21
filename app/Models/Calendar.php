<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calendar extends Model
{
 
    protected $fillable = [
        'title',
        'start', 
        'end',
        'color',
        'user_id',
    ];

    /**
     * Get the user that owns the calendar event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
